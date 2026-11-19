"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

interface Props {
  massing: Volume[];
  /** static drawing shown first (the LCP stays HTML/SVG), and as the reduced-motion still */
  poster: ReactNode;
  title: ReactNode;
  projectName: string;
}

/** The scroll-built building: plan, section, massing, material, light. Pinned with CSS sticky. */
export function HeroModel({ massing, poster, title, projectName }: Props) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [stage, setStage] = useState(0);
  const [hour, setHour] = useState(7);

  useEffect(() => {
    // load the 3D only after first paint, when idle, if WebGL exists and motion is welcome
    if (prefersReducedMotion() || !hasWebGL()) return;
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

  const hh = Math.floor(hour);
  const mm = Math.round((hour - hh) * 60);

  return (
    <section className="hero" ref={root} aria-label="Úvod">
      <div className="hero-stage">
        <div className="hero-poster" data-hidden={ready ? "true" : "false"}>
          {poster}
        </div>
        {enabled && (
          <HeroScene
            massing={massing}
            progress={progress}
            active={active}
            onReady={() => setReady(true)}
            onTime={setHour}
          />
        )}
        <h1 className="hero-title">{title}</h1>
        <div className="hero-caption" aria-live="off">
          <p className="label">
            {projectName}
            {stage === STAGES.length - 1 && (
              <span className="hero-sun">
                {" "}
                · {String(hh).padStart(2, "0")}:{String(mm).padStart(2, "0")}
              </span>
            )}
          </p>
          <ol className="hero-stages" aria-label="Fáze modelu">
            {STAGES.map((s, i) => (
              <li key={s.label} data-active={enabled ? i === stage : i === STAGES.length - 1}>
                {s.label}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
