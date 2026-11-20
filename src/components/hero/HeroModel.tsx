"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Volume } from "@/content/schema";
import { ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/motion";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const STAGES = [
  { at: 0, label: "Půdorys" },
  { at: 0.2, label: "Řez" },
  { at: 0.44, label: "Hmota" },
  { at: 0.62, label: "Materiál" },
  { at: 0.8, label: "Světlo" },
];

let webgl: boolean | undefined;
function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
const isStill = () => prefersReducedMotion() || !hasWebGL();
const noop = () => () => {};

interface Props {
  massing: Volume[];
  /** still shown with reduced motion or without WebGL (the finished building) */
  poster: ReactNode;
  title: ReactNode;
  projectName: string;
}

/** The scroll-built building: plan, section, massing, material, light. Pinned with CSS sticky. */
/**
 * The first stage as a flat plan, in the same scale and framing as the 3D camera's top view,
 * so a reload shows the start of the build (not the finished building) until the 3D is ready.
 */
function PlanPoster({ massing }: { massing: Volume[] }) {
  const minX = Math.min(...massing.map((v) => v.x));
  const maxX = Math.max(...massing.map((v) => v.x + v.w));
  const minZ = Math.min(...massing.map((v) => v.z));
  const maxZ = Math.max(...massing.map((v) => v.z + v.d));
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  const H = 160; // metres visible top to bottom from the 3D top view
  return (
    <svg
      viewBox={`${-H} ${-H / 2} ${2 * H} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="hero-plan"
      aria-hidden="true"
    >
      <g fill="none" stroke="#8fc400" strokeWidth={0.2}>
        {massing
          .filter((v) => v.y === 0)
          .map((v, i) => (
            <rect key={i} pathLength={1} x={v.x - cx} y={v.z - cz} width={v.w} height={v.d} />
          ))}
        <rect
          pathLength={1}
          x={minX - cx - 2.5}
          y={minZ - cz - 2.5}
          width={maxX - minX + 5}
          height={maxZ - minZ + 5}
        />
      </g>
    </svg>
  );
}

export function HeroModel({ massing, poster, title, projectName }: Props) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const labels = useRef<(HTMLElement | null)[]>([]);
  const named = massing.filter((v) => v.label);
  const mounted = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [stage, setStage] = useState(0);
  const [hour, setHour] = useState(7);
  const [started, setStarted] = useState(false);
  // reduced motion or no WebGL: show the finished building as a still instead of the plan
  const still = useSyncExternalStore(noop, isStill, () => false);

  useEffect(() => {
    // a reload always starts the build from the beginning, not from a restored scroll position
    mounted.current = performance.now();
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // load the 3D only after first paint, when idle, if WebGL exists and motion is welcome
    if (isStill()) return;
    const start = () => setEnabled(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start);
    else setTimeout(start, 200);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(!!e?.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(el);
    const vis = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  useGSAP(
    () => {
      if (!root.current) return;
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
          const st = self.progress > 0.025;
          setStarted((prev) => (prev === st ? prev : st));
          let s = 0;
          STAGES.forEach((stg, i) => {
            if (self.progress >= stg.at) s = i;
          });
          setStage((prev) => (prev === s ? prev : s));
        },
      });
      return () => st.kill();
    },
    { scope: root },
  );

  const current = enabled ? stage : STAGES.length - 1;
  const stagesRef = useRef<HTMLOListElement>(null);
  const [dot, setDot] = useState<{ x: number; ready: boolean }>({ x: 0, ready: false });
  useEffect(() => {
    // slide the lime dot under the active stage name
    const ol = stagesRef.current;
    const li = ol?.children[current] as HTMLElement | undefined;
    if (!ol || !li) return;
    const place = () => setDot({ x: li.offsetLeft - 13, ready: true });
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [current]);
  const dotStyle = {
    transform: `translate3d(${dot.x}px, -50%, 0)`,
    opacity: dot.ready ? 1 : 0,
  };

  const hh = Math.floor(hour);
  const mm = Math.round((hour - hh) * 60);

  return (
    <section className="hero" ref={root} aria-label="Úvod">
      <div className="hero-stage">
        <div className="hero-poster" data-hidden={ready ? "true" : "false"}>
          {still ? poster : <PlanPoster massing={massing} />}
        </div>
        {enabled && (
          <HeroScene
            massing={massing}
            labels={labels}
            progress={progress}
            active={active}
            onReady={() => {
              // let the poster finish drawing the plan before the 3D takes over
              const wait = Math.max(0, 2500 - (performance.now() - mounted.current));
              window.setTimeout(() => setReady(true), wait);
            }}
            onTime={setHour}
          />
        )}
        <div className="hero-hint" data-hide={started} aria-hidden={started}>
          <p className="statement">Jeden dům od půdorysu po světlo.</p>
        </div>
        {enabled && (
          <div className="hero-labels" aria-hidden="true">
            {named.map((v, k) => (
              <span
                key={v.label}
                ref={(el) => {
                  labels.current[k] = el;
                }}
                className="hero-tag hero-tag-main"
                style={{ opacity: 0 }}
              >
                {v.label} · {Math.round(v.w * v.d)} m²
              </span>
            ))}
          </div>
        )}
        <div className="hero-fade" aria-hidden="true" />
        <div className="hero-fade hero-fade-right" aria-hidden="true" />
        <h1 className="hero-title">{title}</h1>
        <div className="hero-caption" aria-live="off">
          <p className="hero-time" data-show={enabled && stage === STAGES.length - 1}>
            <span className="hero-sun">
              {String(hh).padStart(2, "0")}:{String(mm).padStart(2, "0")}
            </span>
          </p>
          <p className="label hero-project">{projectName}</p>
          <ol className="hero-stages" aria-label="Fáze modelu" ref={stagesRef}>
            {STAGES.map((s, i) => (
              <li key={s.label} data-active={current === i}>
                {s.label}
              </li>
            ))}
            <span className="hero-dot" aria-hidden="true" style={dotStyle} />
          </ol>
        </div>
      </div>
    </section>
  );
}
