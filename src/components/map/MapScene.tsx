"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { Project } from "@/content/schema";
import { geo, project, WORLD } from "@/lib/geo";
import { reliefAt } from "@/lib/relief";
import { gsap, prefersReducedMotion } from "@/lib/motion";

/* ------------------------------------------------------------------ constants */

const RELIEF = 0.55; // height of the highest ridge in world units (stylised exaggeration)
const SLAB = 0.42; // thickness of the plinth under the relief
const PIN_H = 0.72;
const HEAD = 0.15;
const LIME = "#c8ff2e";
const LIME_DARK = "#c8ff2e"; // one green across the site
const INK = "#0a0a0a";

const HOME = {
  pos: new THREE.Vector3(-1.6, 19.5, 15.2),
  target: new THREE.Vector3(-1.6, -0.4, -0.9),
};

// inverse projection: world x/z back to lon/lat (Mercator fitted in lib/geo)
function makeInverse() {
  // two reference points give a linear map in x; Mercator y needs the real inverse
  const a = project(12, 49);
  const b = project(19, 49);
  const kx = (b.x - a.x) / 7;
  const lonAt = (x: number) => 12 + (x - a.x) / kx;
  const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const p1 = project(15, 49);
  const p2 = project(15, 51);
  const kz = (p2.z - p1.z) / (merc(51) - merc(49));
  const latAt = (z: number) => {
    const m = merc(49) + (z - p1.z) / kz;
    return ((2 * Math.atan(Math.exp(m)) - Math.PI / 2) * 180) / Math.PI;
  };
  return (x: number, z: number) => [lonAt(x), latAt(z)] as const;
}
const inverse = makeInverse();

export function heightAtWorld(x: number, z: number) {
  const [lon, lat] = inverse(x, z);
  return reliefAt(lon, lat) * RELIEF;
}

/* ------------------------------------------------------------------ textures */

function bakeTextures() {
  const W = 2048;
  const H = Math.round((W * WORLD.height) / WORLD.width);
  const toPx = (lon: number, lat: number) => {
    const p = project(lon, lat);
    return [
      ((p.x + WORLD.width / 2) / WORLD.width) * W,
      ((p.z + WORLD.height / 2) / WORLD.height) * H,
    ] as const;
  };

  // colour: paper, contours, regions, rivers
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fbfbfa";
  ctx.fillRect(0, 0, W, H);

  // contours every 0.1 of relief, computed at half resolution
  const cw = W / 2;
  const ch = Math.round(H / 2);
  const hs = new Float32Array(cw * ch);
  for (let j = 0; j < ch; j++) {
    for (let i = 0; i < cw; i++) {
      const x = (i / cw) * WORLD.width - WORLD.width / 2;
      const z = (j / ch) * WORLD.height - WORLD.height / 2;
      hs[j * cw + i] = heightAtWorld(x, z) / RELIEF;
    }
  }
  const img = ctx.getImageData(0, 0, W, H);
  const STEP = 0.09;
  for (let j = 1; j < ch; j++) {
    for (let i = 1; i < cw; i++) {
      const h = hs[j * cw + i]!;
      const band = Math.floor(h / STEP);
      if (
        band !== Math.floor(hs[j * cw + i - 1]! / STEP) ||
        band !== Math.floor(hs[(j - 1) * cw + i]! / STEP)
      ) {
        const strong = band % 5 === 0;
        for (let dy = 0; dy < 2; dy++)
          for (let dx = 0; dx < 2; dx++) {
            const k = ((j * 2 + dy) * W + (i * 2 + dx)) * 4;
            const v = strong ? 150 : 200;
            img.data[k] = v;
            img.data[k + 1] = v;
            img.data[k + 2] = v - 2;
          }
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  const stroke = (ring: readonly (readonly [number, number])[], close: boolean) => {
    ctx.beginPath();
    ring.forEach(([lon, lat], i) => {
      const [x, y] = toPx(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    if (close) ctx.closePath();
    ctx.stroke();
  };
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(10,10,10,0.28)";
  ctx.lineWidth = 1.6;
  ctx.setLineDash([7, 6]);
  geo.regions.forEach((r) => stroke(r.ring, true));
  ctx.setLineDash([]);
  ctx.strokeStyle = "#7f949b";
  ctx.lineWidth = 2.6;
  geo.rivers.forEach((r) => stroke(r.line, false));
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  stroke(geo.border, true);

  // alpha mask: inside the border
  const m = document.createElement("canvas");
  m.width = W;
  m.height = H;
  const mctx = m.getContext("2d")!;
  mctx.fillStyle = "#000";
  mctx.fillRect(0, 0, W, H);
  mctx.fillStyle = "#fff";
  mctx.beginPath();
  geo.border.forEach(([lon, lat], i) => {
    const [x, y] = toPx(lon, lat);
    if (i === 0) mctx.moveTo(x, y);
    else mctx.lineTo(x, y);
  });
  mctx.closePath();
  mctx.fill();

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const alpha = new THREE.CanvasTexture(m);
  return { map, alpha };
}

/* ------------------------------------------------------------------ terrain */

function Terrain({ rise }: { rise: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const { geometry, material, walls, wallMat } = useMemo(() => {
    const SX = 280;
    const SZ = Math.round((SX * WORLD.height) / WORLD.width);
    const g = new THREE.PlaneGeometry(WORLD.width, WORLD.height, SX, SZ);
    g.rotateX(-Math.PI / 2);
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, heightAtWorld(pos.getX(i), pos.getZ(i)));
    }
    g.computeVertexNormals();
    const { map, alpha } = bakeTextures();
    const mat = new THREE.MeshStandardMaterial({
      map,
      alphaMap: alpha,
      alphaTest: 0.5,
      roughness: 0.95,
      metalness: 0,
    });

    // plinth walls along the border, from the slab bottom up to the relief
    const pts = geo.border.map(([lon, lat]) => project(lon, lat));
    const verts: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!;
      const b = pts[(i + 1) % pts.length]!;
      const ha = heightAtWorld(a.x, a.z) + 0.004;
      const hb = heightAtWorld(b.x, b.z) + 0.004;
      verts.push(a.x, -SLAB, a.z, b.x, -SLAB, b.z, b.x, hb, b.z);
      verts.push(a.x, -SLAB, a.z, b.x, hb, b.z, a.x, ha, a.z);
    }
    const wg = new THREE.BufferGeometry();
    wg.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    wg.computeVertexNormals();
    const wm = new THREE.MeshStandardMaterial({
      color: "#c9c8c2",
      roughness: 1,
      side: THREE.DoubleSide,
      flatShading: true,
    });
    return { geometry: g, material: mat, walls: wg, wallMat: wm };
  }, []);

  useFrame(() => {
    if (group.current) group.current.scale.y = Math.max(0.02, rise.current);
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} receiveShadow />
      <mesh geometry={walls} material={wallMat} castShadow receiveShadow />
    </group>
  );
}

/* ------------------------------------------------------------------ pins */

interface PinState {
  hover: boolean;
  active: boolean;
  visible: boolean;
  dim: boolean;
}

function Pin({
  p,
  index,
  intro,
  state,
  onOver,
  onOut,
  onSelect,
  registerHead,
}: {
  p: Project;
  index: number;
  intro: React.MutableRefObject<number>;
  state: React.MutableRefObject<Map<string, PinState>>;
  onOver: (slug: string) => void;
  onOut: (slug: string) => void;
  onSelect: (slug: string) => void;
  registerHead: (slug: string, obj: THREE.Object3D | null) => void;
}) {
  const { x, z } = project(p.lng, p.lat);
  const base = heightAtWorld(x, z);
  const root = useRef<THREE.Group>(null);
  const stem = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const cur = useRef({ y: 0, s: 1, o: 1, sink: 0 });

  const mats = useMemo(() => {
    const filled = p.status === "realizace";
    return {
      stem: new THREE.MeshBasicMaterial({ color: INK, transparent: true }),
      fill: new THREE.MeshStandardMaterial({
        color: filled ? LIME : "#ffffff",
        roughness: 0.7,
        transparent: true,
        emissive: filled ? LIME : "#000000",
        emissiveIntensity: filled ? 0.18 : 0,
      }),
      edge: new THREE.LineBasicMaterial({
        color: p.status === "vystavba" ? LIME_DARK : INK,
        transparent: true,
      }),
    };
  }, [p.status]);
  const headGeo = useMemo(() => new THREE.SphereGeometry(HEAD * 0.62, 24, 16), []);
  const stemGeo = useMemo(
    () => new THREE.BoxGeometry(0.018, PIN_H, 0.018).translate(0, PIN_H / 2, 0),
    [],
  );
  // a thin ring around the sphere reads as the outline (status colour)
  const headEdges = useMemo(() => {
    const pts: number[] = [];
    const r = HEAD * 0.63;
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const b2 = ((i + 1) / 48) * Math.PI * 2;
      pts.push(Math.cos(a) * r, 0, Math.sin(a) * r, Math.cos(b2) * r, 0, Math.sin(b2) * r);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame((_, dt) => {
    const s = state.current.get(p.slug);
    const k = 1 - Math.pow(0.0005, dt); // frame-rate independent damping
    // intro: pins drop in one after another (30 ms stagger, capped)
    const delay = Math.min(index * 0.03, 0.6);
    const t = Math.min(1, Math.max(0, (intro.current - 0.9 - delay) / 0.55));
    const drop = 1 - Math.pow(1 - t, 3);
    const lift = s?.hover || s?.active ? 0.06 : 0;
    const target = s?.visible === false ? -PIN_H - 0.3 : 0;
    cur.current.sink += (target - cur.current.sink) * k;
    cur.current.y += (lift - cur.current.y) * k;
    cur.current.s += ((s?.hover || s?.active ? 1.15 : 1) - cur.current.s) * k;
    cur.current.o += ((s?.dim ? 0.35 : 1) - cur.current.o) * k;
    if (root.current) {
      root.current.position.y = base + (1 - drop) * 1.4 + cur.current.sink + cur.current.y;
      root.current.visible = drop > 0 && cur.current.sink > -PIN_H - 0.25;
    }
    if (stem.current) stem.current.scale.y = Math.max(0.001, drop);
    if (head.current) head.current.scale.setScalar(cur.current.s);
    mats.stem.opacity = cur.current.o;
    mats.fill.opacity = cur.current.o;
    mats.edge.opacity = cur.current.o;
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onOver(p.slug);
  };
  const out = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onOut(p.slug);
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(p.slug);
  };

  return (
    <group ref={root} position={[x, base, z]}>
      <mesh ref={stem} geometry={stemGeo} material={mats.stem} castShadow />
      <group
        ref={(g) => {
          head.current = g;
          registerHead(p.slug, g);
        }}
        position={[0, PIN_H + HEAD / 2, 0]}
      >
        <mesh geometry={headGeo} material={mats.fill} castShadow />
        <lineSegments geometry={headEdges} material={mats.edge} />
      </group>
      {/* generous invisible hit area */}
      <mesh
        position={[0, PIN_H / 2 + 0.08, 0]}
        onPointerOver={over}
        onPointerOut={out}
        onClick={click}
        visible={false}
      >
        <boxGeometry args={[0.42, PIN_H + 0.4, 0.42]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ scene root */

export interface MapSceneHandle {
  flyTo: (slug: string) => void;
  reset: () => void;
  zoom: (dir: 1 | -1) => void;
}

interface SceneProps {
  projects: Project[];
  visible: Set<string>;
  hovered: string | null;
  selected: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  /** called every frame with the screen position of the hovered/selected pin head */
  onAnchor: (x: number, y: number, visible: boolean) => void;
  onReady?: () => void;
}

const Inner = forwardRef<MapSceneHandle, SceneProps & { reduced: boolean }>(function Inner(
  { projects, visible, hovered, selected, onHover, onSelect, onAnchor, onReady, reduced },
  ref,
) {
  const { camera, size, invalidate } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const intro = useRef(reduced ? 10 : -0.35);
  const rise = useRef(reduced ? 1 : 0);
  const heads = useRef(new Map<string, THREE.Object3D>());
  const state = useRef(new Map<string, PinState>());
  const v = useMemo(() => new THREE.Vector3(), []);
  const frames = useRef(0);

  // derived pin state for the frame loop
  useEffect(() => {
    const focus = hovered ?? selected;
    for (const p of projects) {
      state.current.set(p.slug, {
        hover: hovered === p.slug,
        active: selected === p.slug,
        visible: visible.has(p.slug),
        dim: !!focus && focus !== p.slug,
      });
    }
    invalidate();
  }, [projects, visible, hovered, selected, invalidate]);

  // portrait stages need the camera further back so the whole country fits
  const aspect = size.width / Math.max(1, size.height);
  const narrow = size.width < 768;
  const fit = (aspect >= 1.15 ? 1 : Math.min(2.3, 1.15 / aspect)) * (narrow ? 1.8 : 1);
  const homeTarget = useMemo(
    () => (narrow ? new THREE.Vector3(1.2, -0.4, -1.2) : HOME.target.clone()),
    [narrow],
  );
  const homePos = useMemo(() => {
    const offset = HOME.pos.clone().sub(HOME.target).multiplyScalar(fit);
    return homeTarget.clone().add(offset);
  }, [fit, homeTarget]);

  useEffect(() => {
    camera.position.copy(homePos);
    camera.lookAt(homeTarget);
    controls.current?.target.copy(homeTarget);
    controls.current?.update();
  }, [camera, homePos, homeTarget]);

  useFrame((_, dt) => {
    frames.current++;
    if (frames.current === 3) onReady?.(); // terrain, textures and shaders are on screen
    if (frames.current < 3) return;
    if (intro.current < 10) {
      // start the terrain rise just as the loading overlay fades
      intro.current += dt;
      const t = Math.min(1, Math.max(0, intro.current) / 0.9);
      rise.current = 1 - Math.pow(2, -10 * t);
      if (t >= 1) rise.current = 1;
    }
    const focus = hovered ?? selected;
    const obj = focus ? heads.current.get(focus) : undefined;
    if (obj) {
      obj.getWorldPosition(v);
      v.project(camera);
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      onAnchor(x, y, v.z < 1);
    } else {
      onAnchor(0, 0, false);
    }
  });

  const fly = (to: THREE.Vector3, target: THREE.Vector3, duration = 1.2) => {
    const c = controls.current;
    if (!c) return;
    const fromPos = camera.position.clone();
    const fromTarget = c.target.clone();
    const mid = fromPos.clone().lerp(to, 0.5);
    mid.y += fromPos.distanceTo(to) * 0.25; // arc (MO-07)
    const o = { t: 0 };
    gsap.killTweensOf(o);
    gsap.to(o, {
      t: 1,
      duration: reduced ? 0 : duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const t = o.t;
        // quadratic bezier for the camera, straight lerp for the target
        const a = fromPos.clone().lerp(mid, t);
        const b = mid.clone().lerp(to, t);
        camera.position.copy(a.lerp(b, t));
        c.target.copy(fromTarget.clone().lerp(target, t));
        c.update();
        invalidate();
      },
    });
  };

  useImperativeHandle(ref, () => ({
    flyTo(slug: string) {
      const p = projects.find((q) => q.slug === slug);
      if (!p) return;
      const { x, z } = project(p.lng, p.lat);
      const y = heightAtWorld(x, z);
      const target = new THREE.Vector3(x, y + 0.2, z); // the clicked pin lands in the middle
      const dir = new THREE.Vector3(x * 0.15, 0, 1).normalize();
      const pos = target.clone().add(new THREE.Vector3(dir.x * 4.2, 7.6, dir.z * 4.2));
      fly(pos, target);
    },
    reset() {
      fly(homePos.clone(), homeTarget.clone(), 1.0);
    },
    zoom(dir) {
      const c = controls.current;
      if (!c) return;
      const offset = camera.position.clone().sub(c.target);
      const len = THREE.MathUtils.clamp(offset.length() * (dir > 0 ? 0.75 : 1.33), 3.5, 40);
      fly(c.target.clone().add(offset.setLength(len)), c.target.clone(), 0.5);
    },
  }));

  return (
    <>
      <hemisphereLight args={["#ffffff", "#d8d8d2", 1.5]} />
      <directionalLight
        position={[-9, 12, -6]}
        intensity={1.9}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0006}
      />
      {/* the table */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -SLAB - 0.001, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#f1f1ee" roughness={1} />
      </mesh>
      <Terrain rise={rise} />
      {geo.cities.slice(0, 12).map((c) => {
        const { x, z } = project(c.lon, c.lat);
        return (
          <Html
            key={c.name}
            position={[x, heightAtWorld(x, z) + 0.05, z]}
            center
            zIndexRange={[2, 0]}
          >
            <span className="city-label">{c.name}</span>
          </Html>
        );
      })}
      {projects.map((p, i) => (
        <Pin
          key={p.slug}
          p={p}
          index={i}
          intro={intro}
          state={state}
          onOver={(s) => onHover(s)}
          onOut={() => onHover(null)}
          onSelect={onSelect}
          registerHead={(s, o) => {
            if (o) heads.current.set(s, o);
            else heads.current.delete(s);
          }}
        />
      ))}
      <OrbitControls
        ref={controls}
        makeDefault
        target={HOME.target}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={3.5}
        maxDistance={40}
        minPolarAngle={0.12}
        maxPolarAngle={1.18}
        zoomSpeed={0.6}
        rotateSpeed={0.5}
      />
    </>
  );
});

const MapScene = forwardRef<MapSceneHandle, SceneProps>(function MapScene(props, ref) {
  const reduced = prefersReducedMotion();
  return (
    <Canvas
      shadows
      dpr={[1.5, 2]} /* supersampled even on 1x screens, so the thin lines stay clean */
      camera={{ fov: 32, near: 0.1, far: 200, position: HOME.pos.toArray() }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color("#f1f1ee");
        scene.fog = new THREE.Fog("#f1f1ee", 30, 60);
        gl.toneMapping = THREE.NeutralToneMapping;
      }}
      onPointerMissed={() => props.onHover(null)}
      aria-hidden="true"
    >
      <Inner ref={ref} {...props} reduced={reduced} />
    </Canvas>
  );
});

export default MapScene;
