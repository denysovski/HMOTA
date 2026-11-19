"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Volume } from "@/content/schema";

export interface HeroSceneProps {
  massing: Volume[];
  progress: MutableRefObject<number>;
  active: boolean;
  onReady?: () => void;
}

const SCALE = 0.1; // metres to scene units
const LIME = new THREE.Color("#8fc400");
const INK = new THREE.Color("#0a0a0a");
const CLAY = new THREE.Color("#f4f3f0");
const CONCRETE = new THREE.Color("#c9c6bf");
const GLASS = new THREE.Color("#7f9097");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** deterministic context block around the building, drawn as faint plan and ghost volumes */
function contextVolumes(massing: Volume[]): Volume[] {
  const maxX = Math.max(...massing.map((v) => v.x + v.w));
  const maxZ = Math.max(...massing.map((v) => v.z + v.d));
  const minX = Math.min(...massing.map((v) => v.x));
  const minZ = Math.min(...massing.map((v) => v.z));
  const out: Volume[] = [];
  const street = 16;
  const blocks: [number, number, number, number, number][] = [
    [minX - street - 30, minZ - 6, 30, 22, 18],
    [minX - street - 30, minZ + 22, 30, 24, 15],
    [maxX + street, minZ - 10, 26, 30, 21],
    [maxX + street, minZ + 26, 26, 20, 12],
    [minX - 4, minZ - street - 24, 30, 24, 24],
    [minX + 30, minZ - street - 18, 22, 18, 14],
    [minX - 6, maxZ + street, 40, 20, 18],
    [minX + 38, maxZ + street, 18, 26, 27],
  ];
  for (const [x, z, w, d, h] of blocks) out.push({ x, z, w, d, h, y: 0, glass: false });
  return out;
}

function Building({
  massing,
  progress,
}: {
  massing: Volume[];
  progress: MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const cx =
    (Math.min(...massing.map((v) => v.x)) + Math.max(...massing.map((v) => v.x + v.w))) / 2;
  const cz =
    (Math.min(...massing.map((v) => v.z)) + Math.max(...massing.map((v) => v.z + v.d))) / 2;

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
        return {
          v,
          geo,
          edges,
          mat,
          edgeMat,
          pos: new THREE.Vector3(
            (v.x + v.w / 2 - cx) * SCALE,
            v.y * SCALE,
            (v.z + v.d / 2 - cz) * SCALE,
          ),
        };
      }),
    [massing, cx, cz],
  );

  // plan lines: one closed outline per ground footprint, plus the plot, drawn progressively
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
        pts.push(c[i]![0]!, 0.01, c[i]![1]!, c[i + 1]![0]!, 0.01, c[i + 1]![1]!);
    };
    for (const v of massing.filter((m) => m.y === 0)) {
      rect(
        (v.x - cx) * SCALE,
        (v.z - cz) * SCALE,
        (v.x + v.w - cx) * SCALE,
        (v.z + v.d - cz) * SCALE,
      );
    }
    const xs = massing.map((v) => [v.x - cx, v.x + v.w - cx]).flat();
    const zs = massing.map((v) => [v.z - cz, v.z + v.d - cz]).flat();
    const m = 5;
    rect(
      (Math.min(...xs) - m) * SCALE,
      (Math.min(...zs) - m) * SCALE,
      (Math.max(...xs) + m) * SCALE,
      (Math.max(...zs) + m) * SCALE,
    );
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [massing, cx, cz]);
  const planMat = useMemo(() => new THREE.LineBasicMaterial({ color: LIME }), []);
  const planCount = plan.getAttribute("position").count;

  const context = useMemo(() => {
    const vols = contextVolumes(massing);
    const planPts: number[] = [];
    const ghost = new THREE.Group();
    const ghostMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0 });
    for (const v of vols) {
      const x0 = (v.x - cx) * SCALE;
      const z0 = (v.z - cz) * SCALE;
      const x1 = x0 + v.w * SCALE;
      const z1 = z0 + v.d * SCALE;
      planPts.push(x0, 0.005, z0, x1, 0.005, z0, x1, 0.005, z0, x1, 0.005, z1);
      planPts.push(x1, 0.005, z1, x0, 0.005, z1, x0, 0.005, z1, x0, 0.005, z0);
      const box = new THREE.BoxGeometry(v.w * SCALE, v.h * SCALE, v.d * SCALE);
      box.translate((x0 + x1) / 2, (v.h * SCALE) / 2, (z0 + z1) / 2);
      ghost.add(new THREE.LineSegments(new THREE.EdgesGeometry(box), ghostMat));
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.Float32BufferAttribute(planPts, 3));
    return { pg, ghost, ghostMat };
  }, [massing, cx, cz]);
  const contextPlanMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.12 }),
    [],
  );

  const intro = useRef(0);
  useFrame((_, dt) => {
    const p = progress.current;
    intro.current = Math.min(1, intro.current + dt / 2.2);
    const draw = Math.max(ease(intro.current), ease(range(p, 0.02, 0.2)));
    plan.setDrawRange(0, Math.floor((planCount * draw) / 2) * 2);
    planMat.opacity = 1;
    const rise = easeIO(range(p, 0.22, 0.44));
    const fill = ease(range(p, 0.44, 0.6));
    const material = ease(range(p, 0.62, 0.78));
    contextPlanMat.opacity = 0.12 * draw;
    context.ghostMat.opacity = 0.14 * rise * (1 - 0.5 * fill);
    for (const part of parts) {
      part.edgeMat.opacity = rise > 0 ? 0.9 - 0.45 * material : 0;
      part.mat.opacity = fill;
      part.mat.transparent = fill < 1 || part.v.glass;
      const target = part.v.glass ? GLASS : CONCRETE;
      part.mat.color.copy(CLAY).lerp(target, material);
      part.mat.roughness = part.v.glass ? 0.92 - 0.7 * material : 0.92;
      part.mat.metalness = part.v.glass ? 0.25 * material : 0;
      if (part.v.glass && material > 0) part.mat.opacity = fill * (1 - 0.18 * material);
      part.mat.depthWrite = fill > 0.98;
    }
    if (group.current) {
      for (const c of group.current.children) {
        if (!c.userData.part) continue;
        c.scale.y = Math.max(0.0001, rise);
        c.position.y = (c.userData.baseY as number) * rise;
      }
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={context.pg} material={contextPlanMat} />
      <primitive object={context.ghost} />
      <lineSegments geometry={plan} material={planMat} />
      {parts.map((part, i) => (
        <group key={i} position={part.pos} userData={{ part: true, baseY: part.pos.y }}>
          <mesh geometry={part.geo} material={part.mat} castShadow receiveShadow />
          <lineSegments geometry={part.edges} material={part.edgeMat} />
        </group>
      ))}
    </group>
  );
}

function Rig({ progress }: { progress: MutableRefObject<number> }) {
  const { camera, size } = useThree();
  // portrait screens need the camera further back to keep the building in frame
  const aspect = size.width / Math.max(1, size.height);
  const fit = aspect >= 1.2 ? 1 : Math.min(2.2, 1.2 / aspect);
  const top = useMemo(() => new THREE.Vector3(0.001, 26, 0.6), []);
  const axo = useMemo(() => new THREE.Vector3(14, 11, 15), []);
  const close = useMemo(() => new THREE.Vector3(9.5, 4.2, 12.5), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const p = progress.current;
    const t1 = easeIO(range(p, 0.18, 0.46));
    const t2 = easeIO(range(p, 0.78, 1));
    tmp.copy(top).lerp(axo, t1).lerp(close, t2).multiplyScalar(fit);
    camera.position.lerp(tmp, 0.18);
    look.set(0, 0.6 * t1 + 0.4 * t2, 0);
    camera.lookAt(look);
  });
  return null;
}

function Sun({
  progress,
  onTime,
}: {
  progress: MutableRefObject<number>;
  onTime?: (h: number) => void;
}) {
  const light = useRef<THREE.DirectionalLight>(null);
  const last = useRef(-1);
  useFrame(() => {
    const p = progress.current;
    const t = range(p, 0.62, 1); // day goes from 7:00 to 19:00
    const hour = 7 + 12 * t;
    const a = Math.PI * (0.08 + 0.84 * t);
    if (light.current) {
      light.current.position.set(Math.cos(a) * 18, 4 + Math.sin(a) * 14, -8 + t * 4);
      light.current.intensity = 1.2 + 1.6 * range(p, 0.55, 0.7);
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
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-14}
      shadow-camera-right={14}
      shadow-camera-top={14}
      shadow-camera-bottom={-14}
      shadow-bias={-0.0004}
    />
  );
}

export default function HeroScene({
  massing,
  progress,
  active,
  onReady,
  onTime,
}: HeroSceneProps & { onTime?: (h: number) => void }) {
  return (
    <Canvas
      className="hero-canvas"
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 30, near: 0.1, far: 200, position: [0.001, 26, 0.6] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color("#ffffff");
        gl.toneMapping = THREE.NeutralToneMapping;
        onReady?.();
      }}
      aria-hidden="true"
    >
      <hemisphereLight args={["#ffffff", "#dcdcd6", 1.4]} />
      <Sun progress={progress} onTime={onTime} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <shadowMaterial opacity={0.14} />
      </mesh>
      <Building massing={massing} progress={progress} />
      <Rig progress={progress} />
    </Canvas>
  );
}
