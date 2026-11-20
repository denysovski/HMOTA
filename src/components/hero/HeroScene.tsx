"use client";

import { useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Volume } from "@/content/schema";

export interface HeroSceneProps {
  massing: Volume[];
  progress: MutableRefObject<number>;
  active: boolean;
  onReady?: () => void;
  onTime?: (h: number) => void;
}

const SCALE = 0.1; // metres to scene units
const LIME = new THREE.Color("#8fc400");
const INK = new THREE.Color("#0a0a0a");
const CLAY = new THREE.Color("#f4f3f0");
const CONCRETE = new THREE.Color("#cdc9c1");
const GLASS = new THREE.Color("#7f9097");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** stage values shared by every part of the scene, computed once per frame */
interface Stages {
  draw: number; // plan lines
  rise: number; // walls extrude
  fill: number; // clay fill
  material: number; // concrete and glass
  light: number; // sun sweep
}

type Ctx = { minX: number; maxX: number; minZ: number; maxZ: number; cx: number; cz: number };

function bounds(massing: Volume[]): Ctx {
  const minX = Math.min(...massing.map((v) => v.x));
  const maxX = Math.max(...massing.map((v) => v.x + v.w));
  const minZ = Math.min(...massing.map((v) => v.z));
  const maxZ = Math.max(...massing.map((v) => v.z + v.d));
  return { minX, maxX, minZ, maxZ, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2 };
}

const STREET = 16; // metres between blocks

/**
 * The neighbourhood: eight named blocks in the cells of a street grid around the plot
 * (metres, plot coordinates). Streets run between the cells, so nothing overlaps a road.
 */
function context(b: Ctx) {
  const s = STREET;
  const xs: [number, number][] = [
    [b.minX - s - 32, b.minX - s],
    [b.minX, b.maxX],
    [b.maxX + s, b.maxX + s + 28],
  ];
  const zs: [number, number][] = [
    [b.minZ - s - 26, b.minZ - s],
    [b.minZ, b.maxZ],
    [b.maxZ + s, b.maxZ + s + 24],
  ];
  const cells: [number, number, number, string][] = [
    [0, 0, 18, "Bytový dům · 5 NP"],
    [1, 0, 24, "Hotel"],
    [2, 0, 14, "Bytový dům"],
    [0, 1, 15, "Škola"],
    [2, 1, 21, "Kanceláře · 6 NP"],
    [0, 2, 18, "Bytový dům · 5 NP"],
    [1, 2, 12, "Sklad · konverze"],
    [2, 2, 27, "Věžový dům"],
  ];
  return cells.map(([i, j, h, label]) => {
    const [x0, x1] = xs[i]!;
    const [z0, z1] = zs[j]!;
    const inset = 2;
    return {
      x: x0 + inset,
      z: z0 + inset,
      w: x1 - x0 - 2 * inset,
      d: z1 - z0 - 2 * inset,
      h,
      label,
    };
  });
}

/** a DOM label pinned to a 3D point, faded by the frame loop */
function Tag({
  position,
  opacity,
  children,
  className = "hero-tag",
}: {
  position: [number, number, number];
  opacity: () => number;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const o = opacity();
    if (ref.current) {
      ref.current.style.opacity = o.toFixed(3);
      ref.current.style.transform = `translateY(${((1 - o) * 6).toFixed(1)}px)`;
    }
  });
  return (
    <Html position={position} center zIndexRange={[3, 0]} pointerEvents="none">
      <div ref={ref} className={className} style={{ opacity: 0 }}>
        {children}
      </div>
    </Html>
  );
}

const fmt = (m: number) => `${m.toFixed(1).replace(".", ",")} m`;

function Building({ massing, stages }: { massing: Volume[]; stages: MutableRefObject<Stages> }) {
  const group = useRef<THREE.Group>(null);
  const b = useMemo(() => bounds(massing), [massing]);
  const { cx, cz } = b;

  const parts = useMemo(
    () =>
      massing.map((v) => {
        const geo = new THREE.BoxGeometry(v.w * SCALE, v.h * SCALE, v.d * SCALE);
        geo.translate(0, (v.h * SCALE) / 2, 0); // grow from the ground
        const edges = new THREE.EdgesGeometry(geo);
        const mat = new THREE.MeshStandardMaterial({
          color: CLAY.clone(),
          roughness: 0.92,
          metalness: 0,
          transparent: true,
          opacity: 0,
        });
        const edgeMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0 });

        // facade detail on the two faces the camera sees (+x and +z): floors and window bays
        const pts: number[] = [];
        const W = v.w * SCALE;
        const D = v.d * SCALE;
        const H = v.h * SCALE;
        const o = 0.004;
        const floor = 3.4 * SCALE;
        const bay = (v.glass ? 1.5 : 2.7) * SCALE;
        for (let y = floor; y < H - 0.05; y += floor) {
          pts.push(-W / 2, y, D / 2 + o, W / 2, y, D / 2 + o);
          pts.push(W / 2 + o, y, -D / 2, W / 2 + o, y, D / 2);
        }
        for (let x = -W / 2 + bay; x < W / 2 - 0.02; x += bay)
          pts.push(x, 0, D / 2 + o, x, H, D / 2 + o);
        for (let z = -D / 2 + bay; z < D / 2 - 0.02; z += bay)
          pts.push(W / 2 + o, 0, z, W / 2 + o, H, z);
        const facade = new THREE.BufferGeometry();
        facade.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        const facadeMat = new THREE.LineBasicMaterial({
          color: INK,
          transparent: true,
          opacity: 0,
        });

        return {
          v,
          geo,
          edges,
          mat,
          edgeMat,
          facade,
          facadeMat,
          pos: new THREE.Vector3(
            (v.x + v.w / 2 - cx) * SCALE,
            v.y * SCALE,
            (v.z + v.d / 2 - cz) * SCALE,
          ),
        };
      }),
    [massing, cx, cz],
  );

  // plan lines: footprints and the plot, drawn progressively
  const plan = useMemo(() => {
    const pts: number[] = [];
    const rect = (x0: number, z0: number, x1: number, z1: number) => {
      const c = [
        [x0, z0],
        [x1, z0],
        [x1, z1],
        [x0, z1],
        [x0, z0],
      ];
      for (let i = 0; i < 4; i++)
        pts.push(c[i]![0]!, 0.012, c[i]![1]!, c[i + 1]![0]!, 0.012, c[i + 1]![1]!);
    };
    for (const v of massing.filter((m) => m.y === 0)) {
      rect(
        (v.x - cx) * SCALE,
        (v.z - cz) * SCALE,
        (v.x + v.w - cx) * SCALE,
        (v.z + v.d - cz) * SCALE,
      );
    }
    const m = 5;
    rect(
      (b.minX - cx - m) * SCALE,
      (b.minZ - cz - m) * SCALE,
      (b.maxX - cx + m) * SCALE,
      (b.maxZ - cz + m) * SCALE,
    );
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [massing, b, cx, cz]);
  const planMat = useMemo(() => new THREE.LineBasicMaterial({ color: LIME }), []);
  const planCount = plan.getAttribute("position").count;

  // neighbourhood: footprints, ghost volumes that fill in as soft clay, and their names
  const ctx = useMemo(() => {
    const vols = context(b);
    const planPts: number[] = [];
    const ghost = new THREE.Group();
    const ghostMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0 });
    const clayMat = new THREE.MeshStandardMaterial({
      color: "#f7f7f5",
      roughness: 1,
      transparent: true,
      opacity: 0,
    });
    const labels: { pos: [number, number, number]; text: string; h: number }[] = [];
    for (const v of vols) {
      const x0 = (v.x - cx) * SCALE;
      const z0 = (v.z - cz) * SCALE;
      const x1 = x0 + v.w * SCALE;
      const z1 = z0 + v.d * SCALE;
      planPts.push(x0, 0.006, z0, x1, 0.006, z0, x1, 0.006, z0, x1, 0.006, z1);
      planPts.push(x1, 0.006, z1, x0, 0.006, z1, x0, 0.006, z1, x0, 0.006, z0);
      const box = new THREE.BoxGeometry(v.w * SCALE, v.h * SCALE, v.d * SCALE);
      box.translate((x0 + x1) / 2, (v.h * SCALE) / 2, (z0 + z1) / 2);
      ghost.add(new THREE.LineSegments(new THREE.EdgesGeometry(box), ghostMat));
      const mesh = new THREE.Mesh(box, clayMat);
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      ghost.add(mesh);
      labels.push({
        pos: [(x0 + x1) / 2, v.h * SCALE + 0.25, (z0 + z1) / 2],
        text: v.label,
        h: v.h,
      });
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.Float32BufferAttribute(planPts, 3));
    return { pg, ghost, ghostMat, clayMat, labels };
  }, [b, cx, cz]);
  const contextPlanMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.12 }),
    [],
  );

  // dimension lines for the largest volume: width, depth and height
  const main = massing.reduce((a, v) => (v.w * v.d * v.h > a.w * a.d * a.h ? v : a));
  const dims = useMemo(() => {
    const x0 = (main.x - cx) * SCALE;
    const x1 = (main.x + main.w - cx) * SCALE;
    const z0 = (main.z - cz) * SCALE;
    const z1 = (main.z + main.d - cz) * SCALE;
    const H = (main.y + main.h) * SCALE;
    const off = 0.45;
    const t = 0.12;
    // prettier-ignore
    const pts = [
      x0, 0.01, z0 - off, x1, 0.01, z0 - off,
      x0, 0.01, z0 - off - t, x0, 0.01, z0 - off + t,
      x1, 0.01, z0 - off - t, x1, 0.01, z0 - off + t,
      x0 - off, 0.01, z0, x0 - off, 0.01, z1,
      x0 - off - t, 0.01, z0, x0 - off + t, 0.01, z0,
      x0 - off - t, 0.01, z1, x0 - off + t, 0.01, z1,
      x0 - off, 0, z0 - off, x0 - off, H, z0 - off,
      x0 - off - t, H, z0 - off, x0 - off + t, H, z0 - off,
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return {
      g,
      w: {
        pos: [(x0 + x1) / 2, 0.05, z0 - off - 0.32] as [number, number, number],
        text: fmt(main.w),
      },
      d: {
        pos: [x0 - off - 0.45, 0.05, (z0 + z1) / 2] as [number, number, number],
        text: fmt(main.d),
      },
      h: {
        pos: [x0 - off - 0.45, H / 2, z0 - off] as [number, number, number],
        text: fmt(main.y + main.h),
      },
    };
  }, [main, cx, cz]);
  const dimMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0 }),
    [],
  );

  useFrame(() => {
    const { draw, rise, fill, material } = stages.current;
    plan.setDrawRange(0, Math.floor((planCount * draw) / 2) * 2);
    contextPlanMat.opacity = 0.14 * draw;
    ctx.ghostMat.opacity = 0.16 * rise * (1 - 0.4 * fill);
    ctx.clayMat.opacity = 0.55 * fill;
    ctx.clayMat.depthWrite = fill > 0.95;
    const cast = fill > 0.35; // neighbours cast shadows only once they are filled in
    if (ctx.ghost.userData.cast !== cast) {
      ctx.ghost.userData.cast = cast;
      ctx.ghost.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) o.castShadow = cast;
      });
    }
    dimMat.opacity = 0.75 * rise;
    for (const part of parts) {
      part.edgeMat.opacity = rise > 0 ? 0.9 - 0.45 * material : 0;
      part.mat.opacity = fill;
      part.mat.transparent = fill < 1 || part.v.glass;
      part.mat.color.copy(CLAY).lerp(part.v.glass ? GLASS : CONCRETE, material);
      part.mat.roughness = part.v.glass ? 0.92 - 0.7 * material : 0.92;
      part.mat.metalness = part.v.glass ? 0.25 * material : 0;
      if (part.v.glass && material > 0) part.mat.opacity = fill * (1 - 0.18 * material);
      part.mat.depthWrite = fill > 0.98;
      part.facadeMat.opacity = 0.32 * material;
    }
    if (group.current) {
      for (const c of group.current.children) {
        if (!c.userData.part) continue;
        c.scale.y = Math.max(0.0001, rise);
        c.position.y = (c.userData.baseY as number) * rise;
      }
    }
  });

  const s = stages;
  return (
    <group ref={group}>
      <lineSegments geometry={ctx.pg} material={contextPlanMat} />
      <primitive object={ctx.ghost} />
      <lineSegments geometry={plan} material={planMat} />
      <lineSegments geometry={dims.g} material={dimMat} />
      {parts.map((part, i) => (
        <group key={i} position={part.pos} userData={{ part: true, baseY: part.pos.y }}>
          <mesh geometry={part.geo} material={part.mat} castShadow receiveShadow />
          <lineSegments geometry={part.edges} material={part.edgeMat} />
          <lineSegments geometry={part.facade} material={part.facadeMat} />
        </group>
      ))}

      {massing
        .filter((v) => v.label)
        .map((v, i) => (
          <Tag
            key={`pl${i}`}
            position={[
              (v.x + v.w / 2 - cx) * SCALE + (i % 2 ? 0.9 : 0),
              (v.y + v.h) * SCALE + 0.35,
              (v.z + v.d / 2 - cz) * SCALE,
            ]}
            opacity={() => s.current.draw * (0.4 + 0.6 * s.current.fill)}
            className="hero-tag hero-tag-main"
          >
            {v.label} · {Math.round(v.w * v.d)} m²
          </Tag>
        ))}
      {ctx.labels.map((l, i) => (
        <Tag
          key={`c${i}`}
          position={l.pos}
          opacity={() => 0.85 * s.current.fill * (1 - 0.35 * s.current.light)}
        >
          {l.text} · {l.h} m
        </Tag>
      ))}
      <Tag position={dims.w.pos} opacity={() => s.current.rise} className="hero-tag hero-dim">
        {dims.w.text}
      </Tag>
      <Tag position={dims.d.pos} opacity={() => s.current.rise} className="hero-tag hero-dim">
        {dims.d.text}
      </Tag>
      <Tag position={dims.h.pos} opacity={() => s.current.rise} className="hero-tag hero-dim">
        {dims.h.text}
      </Tag>
    </group>
  );
}

/** streets, river, trees and people: the things that make the model read as a real place */
function Site({ massing, stages }: { massing: Volume[]; stages: MutableRefObject<Stages> }) {
  const b = useMemo(() => bounds(massing), [massing]);
  const trees = useRef<THREE.Group>(null);
  const people = useRef<THREE.Group>(null);

  const data = useMemo(() => {
    const u = (m: number) => m * SCALE;
    const halfW = (b.maxX - b.minX) / 2;
    const halfD = (b.maxZ - b.minZ) / 2;
    const sx = [-halfW - STREET / 2, halfW + STREET / 2];
    const sz = [-halfD - STREET / 2, halfD + STREET / 2];
    const len = 260;
    const roads: { x: number; z: number; w: number; d: number }[] = [];
    for (const x of sx) roads.push({ x: u(x), z: 0, w: u(STREET - 6), d: u(len) });
    for (const z of sz) roads.push({ x: 0, z: u(z), w: u(len), d: u(STREET - 6) });
    const dash: number[] = [];
    for (const x of sx)
      for (let z = -len / 2; z < len / 2; z += 6)
        dash.push(u(x), 0.008, u(z), u(x), 0.008, u(z + 3));
    for (const z of sz)
      for (let x = -len / 2; x < len / 2; x += 6)
        dash.push(u(x), 0.008, u(z), u(x + 3), 0.008, u(z));
    const dashG = new THREE.BufferGeometry();
    dashG.setAttribute("position", new THREE.Float32BufferAttribute(dash, 3));
    const rnd = (i: number) => {
      const s = Math.sin(i * 91.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const treePos: [number, number, number][] = [];
    const inCrossing = (v: number, lines: number[]) =>
      lines.some((c) => Math.abs(v - c) < STREET / 2 + 2);
    let k = 0;
    for (const x of sx)
      for (let z = -80; z <= 80; z += 10) {
        if (inCrossing(z, sz)) continue;
        for (const side of [-1, 1])
          if (rnd(k++) > 0.35)
            treePos.push([u(x + side * (STREET / 2 - 1.2)), 0, u(z + rnd(k) * 2)]);
      }
    for (const z of sz)
      for (let x = -80; x <= 80; x += 10) {
        if (inCrossing(x, sx)) continue;
        for (const side of [-1, 1])
          if (rnd(k++) > 0.35)
            treePos.push([u(x + rnd(k) * 2), 0, u(z + side * (STREET / 2 - 1.2))]);
      }
    const peoplePos: [number, number, number][] = [
      [u(halfW + 3), 0, u(halfD + 2)],
      [u(halfW + 4.2), 0, u(halfD + 3.5)],
      [u(-halfW + 6), 0, u(halfD + 4)],
      [u(2), 0, u(halfD + 5)],
      [u(halfW + 1), 0, u(-halfD - 3)],
    ];
    const riverZ = u(-halfD - STREET - 26 - STREET - 12);
    return { roads, dashG, treePos, peoplePos, riverZ };
  }, [b]);

  const mats = useMemo(
    () => ({
      road: new THREE.MeshBasicMaterial({ color: "#efefec", transparent: true, opacity: 0 }),
      dash: new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0 }),
      water: new THREE.MeshBasicMaterial({ color: "#e3eaec", transparent: true, opacity: 0 }),
      crown: new THREE.MeshStandardMaterial({ color: "#f2f2ee", roughness: 1 }),
      trunk: new THREE.MeshStandardMaterial({ color: "#b9b4aa", roughness: 1 }),
      person: new THREE.MeshStandardMaterial({ color: "#3a3a38", roughness: 1 }),
    }),
    [],
  );
  const green = useMemo(() => new THREE.Color("#cfdcc0"), []);
  const white = useMemo(() => new THREE.Color("#f2f2ee"), []);

  useFrame(() => {
    const { draw, fill, material } = stages.current;
    mats.road.opacity = 0.9 * draw;
    mats.dash.opacity = 0.9 * fill;
    mats.water.opacity = draw;
    mats.crown.color.copy(white).lerp(green, material);
    const g = ease(fill);
    if (trees.current) {
      trees.current.visible = g > 0.001;
      trees.current.children.forEach((t, i) => {
        t.scale.setScalar(Math.max(0.0001, clamp01(g * 1.4 - (i % 7) * 0.05)));
      });
    }
    if (people.current) people.current.visible = material > 0.05;
  });

  return (
    <group>
      {data.roads.map((r, i) => (
        <mesh key={i} position={[r.x, 0.003, r.z]} rotation-x={-Math.PI / 2} material={mats.road}>
          <planeGeometry args={[r.w, r.d]} />
        </mesh>
      ))}
      <lineSegments geometry={data.dashG} material={mats.dash} />
      <mesh position={[0, 0.002, data.riverZ]} rotation-x={-Math.PI / 2} material={mats.water}>
        <planeGeometry args={[60, 4.5]} />
      </mesh>
      <Tag
        position={[-4, 0.1, data.riverZ]}
        opacity={() => 0.8 * stages.current.draw}
        className="hero-tag hero-tag-water"
      >
        Vltava · přístav Holešovice
      </Tag>
      <group ref={trees}>
        {data.treePos.map((p, i) => (
          <group key={i} position={p}>
            <mesh position={[0, 0.16, 0]} material={mats.trunk} castShadow>
              <cylinderGeometry args={[0.018, 0.024, 0.32, 6]} />
            </mesh>
            <mesh position={[0, 0.48, 0]} material={mats.crown} castShadow receiveShadow>
              <icosahedronGeometry args={[0.26 + (i % 3) * 0.04, 1]} />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={people}>
        {data.peoplePos.map((p, i) => (
          <group key={i} position={p}>
            <mesh position={[0, 0.085, 0]} material={mats.person} castShadow>
              <capsuleGeometry args={[0.022, 0.12, 3, 8]} />
            </mesh>
            <mesh position={[0, 0.185, 0]} material={mats.person} castShadow>
              <sphereGeometry args={[0.022, 10, 8]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function Rig({ progress }: { progress: MutableRefObject<number> }) {
  const { camera, size } = useThree();
  // portrait screens need the camera further back to keep the building in frame
  const aspect = size.width / Math.max(1, size.height);
  const fit = aspect >= 1.2 ? 1 : Math.min(2.2, 1.2 / aspect);
  const top = useMemo(() => new THREE.Vector3(0.001, 30, 0.6), []);
  const axo = useMemo(() => new THREE.Vector3(15, 12, 16.5), []);
  const close = useMemo(() => new THREE.Vector3(10.5, 4.8, 13.5), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const p = progress.current;
    const t1 = easeIO(range(p, 0.18, 0.46));
    const t2 = easeIO(range(p, 0.78, 1));
    tmp.copy(top).lerp(axo, t1).lerp(close, t2).multiplyScalar(fit);
    camera.position.lerp(tmp, 0.12);
    look.set(0, 0.6 * t1 + 0.4 * t2, 0);
    camera.lookAt(look);
  });
  return null;
}

function Sun({
  stages,
  onTime,
}: {
  stages: MutableRefObject<Stages>;
  onTime?: (h: number) => void;
}) {
  const light = useRef<THREE.DirectionalLight>(null);
  const last = useRef(-1);
  useFrame(() => {
    const t = stages.current.light; // the day goes from 7:00 to 19:00
    const hour = 7 + 12 * t;
    const a = Math.PI * (0.08 + 0.84 * t);
    if (light.current) {
      light.current.position.set(Math.cos(a) * 18, 4 + Math.sin(a) * 14, -8 + t * 4);
      light.current.intensity = 1.2 + 1.6 * clamp01(stages.current.material * 1.4);
      const warm = t > 0 ? 1 - Math.sin(Math.PI * t) : 0; // warm low sun morning and evening
      light.current.color.setRGB(1, 1 - 0.1 * warm, 1 - 0.22 * warm);
    }
    const rounded = Math.round(hour * 4) / 4;
    if (rounded !== last.current) {
      last.current = rounded;
      onTime?.(rounded);
    }
  });
  return (
    <directionalLight
      ref={light}
      castShadow
      intensity={1.2}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-16}
      shadow-camera-right={16}
      shadow-camera-top={16}
      shadow-camera-bottom={-16}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
  );
}

/** turns scroll progress (plus a short intro on load) into the five stage values */
function Driver({
  progress,
  stages,
}: {
  progress: MutableRefObject<number>;
  stages: MutableRefObject<Stages>;
}) {
  const intro = useRef(0);
  useFrame((_, dt) => {
    const p = progress.current;
    intro.current = Math.min(1, intro.current + dt / 2.2);
    stages.current = {
      draw: Math.max(ease(intro.current), ease(range(p, 0.02, 0.2))),
      rise: easeIO(range(p, 0.22, 0.44)),
      fill: ease(range(p, 0.44, 0.6)),
      material: ease(range(p, 0.62, 0.78)),
      light: range(p, 0.62, 1),
    };
  });
  return null;
}

export default function HeroScene({ massing, progress, active, onReady, onTime }: HeroSceneProps) {
  const stages = useRef<Stages>({ draw: 0, rise: 0, fill: 0, material: 0, light: 0 });
  return (
    <Canvas
      className="hero-canvas"
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 30, near: 0.1, far: 300, position: [0.001, 30, 0.6] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color("#ffffff");
        scene.fog = new THREE.Fog("#ffffff", 34, 70);
        gl.toneMapping = THREE.NeutralToneMapping;
        onReady?.();
      }}
      aria-hidden="true"
    >
      <Driver progress={progress} stages={stages} />
      <hemisphereLight args={["#ffffff", "#dcdcd6", 1.4]} />
      <Sun stages={stages} onTime={onTime} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <shadowMaterial opacity={0.16} />
      </mesh>
      <Site massing={massing} stages={stages} />
      <Building massing={massing} stages={stages} />
      <Rig progress={progress} />
    </Canvas>
  );
}
