"use client";

import { memo, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Volume } from "@/content/schema";

export interface HeroSceneProps {
  massing: Volume[];
  /** label elements for the named volumes, in order; positioned by the scene every frame */
  labels: MutableRefObject<(HTMLElement | null)[]>;
  progress: MutableRefObject<number>;
  active: boolean;
  onReady?: () => void;
  onTime?: (h: number) => void;
  /** receives the scene's invalidate(): the page calls it on scroll, so frames render on demand */
  kick?: MutableRefObject<(() => void) | null>;
}

const SCALE = 0.1; // metres to scene units
const LIME = new THREE.Color("#c8ff2e");
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
  draw: number; // neighbourhood plan: streets and neighbouring footprints fade in first
  main: number; // then the plot and the building's own footprint, last
  rise: number; // walls extrude
  fill: number; // clay fill
  material: number; // concrete and glass
  light: number; // sun sweep
  labels: number; // callouts draw in once scrolling starts
  trees: number; // trees grow in
  people: number; // people fade in on the pavements
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

/**
 * A label held away from the building, joined to the top of a volume by a hairline. The anchor
 * follows the volume as it rises, so the label and its line travel up with the building.
 */
function Callout({
  anchor,
  offset,
  opacity,
  el,
}: {
  anchor: (out: THREE.Vector3) => void;
  offset: [number, number, number];
  opacity: () => number;
  /** the label element (rendered by HeroModel above the canvas) */
  el: () => HTMLElement | null | undefined;
}) {
  const { camera, size } = useThree();
  const dot = useRef<THREE.Mesh>(null);
  const a = useMemo(() => new THREE.Vector3(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
    return g;
  }, []);
  const lineMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0 }),
    [],
  );
  const dotMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#c8ff2e", transparent: true, opacity: 0 }),
    [],
  );
  useFrame(() => {
    anchor(a);
    const o = opacity();
    const pos = line.getAttribute("position") as THREE.BufferAttribute;
    pos.setXYZ(0, a.x, a.y, a.z);
    pos.setXYZ(1, a.x + offset[0] * o, a.y + offset[1] * o, a.z + offset[2] * o);
    pos.needsUpdate = true;
    line.computeBoundingSphere();
    lineMat.opacity = 0.7 * o;
    dotMat.opacity = o;
    dot.current?.position.copy(a);
    const node = el();
    if (node) {
      p.set(a.x + offset[0] * o, a.y + offset[1] * o, a.z + offset[2] * o).project(camera);
      const x = ((p.x + 1) / 2) * size.width;
      const y = ((1 - p.y) / 2) * size.height;
      node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      node.style.opacity = (p.z < 1 ? o : 0).toFixed(3);
      node.style.pointerEvents = o > 0.6 ? "auto" : "none";
    }
  });
  return (
    <>
      <lineSegments geometry={line} material={lineMat} />
      <mesh ref={dot} material={dotMat}>
        <sphereGeometry args={[0.06, 16, 12]} />
      </mesh>
    </>
  );
}

function Building({
  massing,
  stages,
  labels,
}: {
  massing: Volume[];
  stages: MutableRefObject<Stages>;
  labels: MutableRefObject<(HTMLElement | null)[]>;
}) {
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
          mesh: undefined as THREE.Mesh | undefined,
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
    const m = STREET / 2 - (STREET - 6) / 2; // on the kerb, like the edge of every other block
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
  const planMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: 0 }),
    [],
  );

  // neighbourhood: footprints, ghost volumes that fill in as soft clay, and their names
  const ctx = useMemo(() => {
    const vols = context(b);
    const planPts: number[] = [];
    const ghost = new THREE.Group();
    const ghostMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0 });
    const clayMat = new THREE.MeshStandardMaterial({
      color: "#f3f3f0",
      roughness: 1,
      transparent: true,
      opacity: 0,
    });
    const labels: { pos: [number, number, number]; text: string; h: number }[] = [];
    const meshes: THREE.Mesh[] = [];
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
      clayMat.depthWrite = false;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      meshes.push(mesh);
      mesh.renderOrder = -1;
      ghost.add(mesh);
      labels.push({
        pos: [(x0 + x1) / 2, v.h * SCALE + 0.25, (z0 + z1) / 2],
        text: v.label,
        h: v.h,
      });
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.Float32BufferAttribute(planPts, 3));
    return { pg, ghost, ghostMat, clayMat, labels, meshes };
  }, [b, cx, cz]);
  const contextPlanMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.12 }),
    [],
  );

  useFrame(() => {
    const { draw, main, rise, fill, material } = stages.current;
    planMat.opacity = main;
    contextPlanMat.opacity = 0.14 * draw;
    // neighbours stay a faint ghost: a hint of the street, never competing with the building
    ctx.ghostMat.opacity = 0.1 * rise;
    ctx.clayMat.opacity = 0.16 * fill;
    for (const m of ctx.meshes) m.castShadow = fill > 0.4;
    for (const part of parts) {
      if (part.mesh) part.mesh.castShadow = fill > 0.5;
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
      {parts.map((part, i) => (
        <group key={i} position={part.pos} userData={{ part: true, baseY: part.pos.y }}>
          <mesh
            geometry={part.geo}
            material={part.mat}
            receiveShadow
            ref={(m) => {
              if (m) part.mesh = m;
            }}
          />
          <lineSegments geometry={part.edges} material={part.edgeMat} />
          <lineSegments geometry={part.facade} material={part.facadeMat} />
        </group>
      ))}

      {massing
        .map((v, i) => ({ v, i }))
        .filter(({ v }) => v.label)
        .map(({ v, i }, k) => {
          const x = (v.x + v.w / 2 - cx) * SCALE;
          const z = (v.z + v.d / 2 - cz) * SCALE;
          const offsets: [number, number, number][] = [
            [-1.9, 1.15, -0.7],
            [2.1, 0.85, 1.5],
          ];
          return (
            <Callout
              key={`co${i}`}
              anchor={(out) => out.set(x, (v.y + v.h) * SCALE * s.current.rise + 0.02, z)}
              offset={offsets[k % 2]!}
              opacity={() => s.current.labels}
              el={() => labels.current[k]}
            />
          );
        })}
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
    // road edges, drawn like a plan: kerb lines and centre dashes, broken at every crossing
    const half = (STREET - 6) / 2;
    const gaps = (lines: number[]) => lines.map((c) => [c - half, c + half] as const);
    const segments = (from: number, to: number, cut: readonly (readonly [number, number])[]) => {
      const out: [number, number][] = [];
      let start = from;
      for (const [a, b] of [...cut].sort((p, q) => p[0] - q[0])) {
        if (a > start) out.push([start, a]);
        start = Math.max(start, b);
      }
      if (start < to) out.push([start, to]);
      return out;
    };
    // every line is cut into short pieces whose alpha falls off with distance from the plot,
    // so the streets fade out into the paper instead of ending at an edge
    const fade = (x: number, z: number) => {
      const r = Math.hypot(x, z * 1.15);
      return Math.max(0, Math.min(1, 1 - (r - 38) / 62)) ** 1.6;
    };
    const build = (segs: [number, number, number, number][], y: number) => {
      const pos: number[] = [];
      const col: number[] = [];
      const step = 4;
      for (const [x0, z0, x1, z1] of segs) {
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / step));
        for (let i = 0; i < n; i++) {
          const ax = x0 + ((x1 - x0) * i) / n;
          const az = z0 + ((z1 - z0) * i) / n;
          const bx = x0 + ((x1 - x0) * (i + 1)) / n;
          const bz = z0 + ((z1 - z0) * (i + 1)) / n;
          const fa = fade(ax, az);
          const fb = fade(bx, bz);
          if (fa <= 0 && fb <= 0) continue;
          pos.push(u(ax), y, u(az), u(bx), y, u(bz));
          col.push(0, 0, 0, fa, 0, 0, 0, fb);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(col, 4));
      return g;
    };
    const kerbSegs: [number, number, number, number][] = [];
    for (const x of sx)
      for (const side of [-half, half])
        for (const [z0, z1] of segments(-len / 2, len / 2, gaps(sz)))
          kerbSegs.push([x + side, z0, x + side, z1]);
    for (const z of sz)
      for (const side of [-half, half])
        for (const [x0, x1] of segments(-len / 2, len / 2, gaps(sx)))
          kerbSegs.push([x0, z + side, x1, z + side]);
    const kerbG = build(kerbSegs, 0.006);
    const dashSegs: [number, number, number, number][] = [];
    const inGap = (v: number, lines: number[]) => lines.some((c) => Math.abs(v - c) < half + 1);
    for (const x of sx)
      for (let z = -len / 2; z < len / 2; z += 6)
        if (!inGap(z, sz) && !inGap(z + 3, sz)) dashSegs.push([x, z, x, z + 3]);
    for (const z of sz)
      for (let x = -len / 2; x < len / 2; x += 6)
        if (!inGap(x, sx) && !inGap(x + 3, sx)) dashSegs.push([x, z, x + 3, z]);
    const dashG = build(dashSegs, 0.008);
    const rnd = (i: number) => {
      const s = Math.sin(i * 91.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const treePos: [number, number, number][] = [];
    const inCrossing = (v: number, lines: number[]) =>
      lines.some((c) => Math.abs(v - c) < STREET / 2 + 2);
    let k = 0;
    for (const x of sx)
      for (let z = -80; z <= 80; z += 14) {
        if (inCrossing(z, sz)) continue;
        for (const side of [-1, 1])
          if (rnd(k++) > 0.68)
            treePos.push([u(x + side * (STREET / 2 - 1.2)), 0, u(z + rnd(k) * 2)]);
      }
    for (const z of sz)
      for (let x = -80; x <= 80; x += 14) {
        if (inCrossing(x, sx)) continue;
        for (const side of [-1, 1])
          if (rnd(k++) > 0.68)
            treePos.push([u(x + rnd(k) * 2), 0, u(z + side * (STREET / 2 - 1.2))]);
      }
    // pavements run 1.5 m inside each block edge, between the kerb and the building line
    const walk = STREET / 2 - 1.5;
    const peoplePos: [number, number, number][] = [
      [u(sx[0]! - walk), 0, u(-halfD - 22)],
      [u(-halfW + 4), 0, u(sz[1]! - walk)],
      [u(sx[1]! - walk), 0, u(halfD - 3)],
      [u(sx[1]! + walk), 0, u(-halfD + 6)],
      [u(halfW + 30), 0, u(sz[1]! + walk)],
      [u(-halfW - 36), 0, u(sz[0]! - walk)],
      [u(4), 0, u(sz[0]! + walk)],
    ];
    const riverZ = u(-halfD - STREET - 26 - STREET - 12);
    return { kerbG, dashG, treePos, peoplePos, riverZ };
  }, [b]);

  const mats = useMemo(
    () => ({
      road: new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 }),
      dash: new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 }),
      water: new THREE.MeshBasicMaterial({ color: "#c8ff2e", transparent: true, opacity: 0 }),
      crown: new THREE.MeshStandardMaterial({ color: "#c8ff2e", roughness: 0.95 }),
      trunk: new THREE.MeshStandardMaterial({ color: "#b9b4aa", roughness: 1 }),
      person: new THREE.MeshStandardMaterial({
        color: "#3a3a38",
        roughness: 1,
        transparent: true,
        opacity: 0,
      }),
    }),
    [],
  );

  useFrame(() => {
    const { draw, rise, trees: grow, people: walkers } = stages.current;
    mats.road.opacity = 0.22 * draw;
    mats.dash.opacity = 0.14 * draw;
    // the lime strip stays hidden in the plan view and fades in once the model tilts
    mats.water.opacity = 0.3 * ease(clamp01((rise - 0.35) / 0.65));
    const g = grow;
    if (trees.current) {
      trees.current.visible = g > 0.001;
      trees.current.children.forEach((t, i) => {
        t.scale.setScalar(Math.max(0.0001, clamp01(g * 1.4 - (i % 7) * 0.05)));
      });
    }
    mats.person.opacity = walkers;
    if (people.current) {
      people.current.visible = walkers > 0.01;
      people.current.position.y = (1 - walkers) * 0.08;
      people.current.children.forEach((c) =>
        c.children.forEach((m) => ((m as THREE.Mesh).castShadow = walkers > 0.6)),
      );
    }
  });

  return (
    <group>
      <lineSegments geometry={data.kerbG} material={mats.road} />
      <lineSegments geometry={data.dashG} material={mats.dash} />
      <mesh position={[0, 0.002, data.riverZ]} rotation-x={-Math.PI / 2} material={mats.water}>
        <planeGeometry args={[60, 4.5]} />
      </mesh>
      <group ref={trees}>
        {data.treePos.map((p, i) => (
          <group key={i} position={p}>
            <mesh position={[0, 0.16, 0]} material={mats.trunk} castShadow>
              <cylinderGeometry args={[0.018, 0.024, 0.32, 6]} />
            </mesh>
            <mesh position={[0, 0.48, 0]} material={mats.crown} castShadow receiveShadow>
              <sphereGeometry args={[0.26 + (i % 3) * 0.04, 18, 12]} />
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
  const { camera, size, invalidate } = useThree();
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
    if (camera.position.distanceToSquared(tmp) > 1e-6) invalidate();
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
  /** receives the scene's invalidate(): the page calls it on scroll, so frames render on demand */
  kick?: MutableRefObject<(() => void) | null>;
}) {
  const light = useRef<THREE.DirectionalLight>(null);
  const small = useThree((st) => st.size.width < 768);
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
      shadow-mapSize-width={small ? 1024 : 1536}
      shadow-mapSize-height={small ? 1024 : 1536}
      shadow-camera-left={-24}
      shadow-camera-right={24}
      shadow-camera-top={24}
      shadow-camera-bottom={-24}
      shadow-camera-far={80}
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
  // on load the plan fades in by itself (~1.3 s): the streets and neighbours first, the plot last
  const intro = useRef(-0.08);
  const last = useRef(-1);
  useFrame(({ gl, invalidate }, dt) => {
    if (intro.current < 1) {
      intro.current = Math.min(1, intro.current + Math.min(dt, 0.05) / 1.3);
      invalidate();
    }
    // the shadow map is the heaviest pass: redraw it only when the model or the sun changed
    const key = progress.current + intro.current;
    gl.shadowMap.needsUpdate = key !== last.current;
    last.current = key;
    const p = progress.current;
    const t = intro.current;
    const scrolled = range(p, 0.02, 0.2);
    stages.current = {
      draw: Math.max(ease(clamp01(t / 0.6)), scrolled),
      main: Math.max(ease(clamp01((t - 0.5) / 0.5)), scrolled),
      rise: easeIO(range(p, 0.22, 0.44)),
      fill: ease(range(p, 0.44, 0.6)),
      material: ease(range(p, 0.6, 0.86)),
      light: range(p, 0.62, 1),
      labels: ease(range(p, 0.04, 0.2)),
      trees: ease(range(p, 0.46, 0.76)),
      people: ease(range(p, 0.58, 0.78)),
    };
  });
  return null;
}

function HeroScene({ massing, labels, progress, active, onReady, onTime, kick }: HeroSceneProps) {
  const stages = useRef<Stages>({
    draw: 0,
    main: 0,
    rise: 0,
    fill: 0,
    material: 0,
    light: 0,
    labels: 0,
    trees: 0,
    people: 0,
  });
  return (
    <Canvas
      className="hero-canvas"
      shadows
      dpr={[1, 1.5]}
      frameloop={active ? "demand" : "never"}
      camera={{ fov: 30, near: 0.1, far: 300, position: [0.001, 30, 0.6] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl, scene, invalidate }) => {
        if (kick) kick.current = () => invalidate();
        scene.background = new THREE.Color("#ffffff");
        scene.fog = new THREE.Fog("#ffffff", 34, 70);
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.shadowMap.autoUpdate = false;
        gl.shadowMap.needsUpdate = true;
        onReady?.();
      }}
      aria-hidden="true"
    >
      <Driver progress={progress} stages={stages} />
      <hemisphereLight args={["#ffffff", "#dcdcd6", 1.4]} />
      <Sun stages={stages} onTime={onTime} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <shadowMaterial opacity={0.11} />
      </mesh>
      <Site massing={massing} stages={stages} />
      <Building massing={massing} stages={stages} labels={labels} />
      <Rig progress={progress} />
    </Canvas>
  );
}

// the page re-renders on every stage change; the canvas has no reason to
export default memo(HeroScene);
