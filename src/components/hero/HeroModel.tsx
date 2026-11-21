"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
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

// the two building labels lean a little towards the cursor (a few px), and spring back on leave
const PULL = 0.22;
const MAX = 7;
function magnet(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const dx = Math.max(-MAX, Math.min(MAX, (e.clientX - (r.left + r.width / 2)) * PULL));
  const dy = Math.max(-MAX, Math.min(MAX, (e.clientY - (r.top + r.height / 2)) * PULL));
  const tag = el.firstElementChild as HTMLElement | null;
  if (tag) tag.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
}
function release(e: React.PointerEvent<HTMLElement>) {
  const tag = e.currentTarget.firstElementChild as HTMLElement | null;
  if (tag) tag.style.transform = "";
}

/** The scroll-built building: plan, section, massing, material, light. Pinned with CSS sticky. */
export function HeroModel({ massing, poster, title, projectName }: Props) {
  const root = useRef<HTMLElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const kick = useRef<(() => void) | null>(null);
  const progress = useRef(0);
  const labels = useRef<(HTMLElement | null)[]>([]);
  const named = massing.filter((v) => v.label);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const [active, setActive] = useState(true);
  const [stage, setStage] = useState(0);
  const [hour, setHour] = useState(7);
  const [started, setStarted] = useState(false);
  // reduced motion or no WebGL: show the finished building as a still instead of the plan
  const still = useSyncExternalStore(noop, isStill, () => false);

  useEffect(() => {
    // a reload always starts the build from the beginning, not from a restored scroll position
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // load the 3D straight away (not "when idle": idle never comes while the visitor scrolls)
    if (isStill()) return;
    void import("./HeroScene");
    const raf = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(raf);
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
          kick.current?.();
          ring.current?.style.setProperty("stroke-dashoffset", String(1 - self.progress));
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

  const current = still ? STAGES.length - 1 : stage;
  const stagesRef = useRef<HTMLOListElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number; ready: boolean }>({
    x: 0,
    w: 0,
    ready: false,
  });
  useEffect(() => {
    // slide the green pill behind the active stage name
    const ol = stagesRef.current;
    const li = ol?.children[current] as HTMLElement | undefined;
    if (!ol || !li) return;
    const place = () => setPill({ x: li.offsetLeft, w: li.offsetWidth, ready: true });
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [current]);
  const pillStyle = {
    width: `${pill.w}px`,
    transform: `translate3d(${pill.x}px, -50%, 0)`,
    opacity: pill.ready ? 1 : 0,
  };

  const hh = Math.floor(hour);
  const mm = Math.round((hour - hh) * 60);

  return (
    <section className="hero" ref={root} aria-label="Úvod">
      <div className="hero-stage">
        <div className="hero-poster" data-hidden={ready ? "true" : "false"}>
          {still ? poster : null}
        </div>
        {enabled && (
          <HeroScene
            massing={massing}
            labels={labels}
            progress={progress}
            active={active}
            onReady={onReady}
            onTime={setHour}
            kick={kick}
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
                className="hero-tag-anchor"
                style={{ opacity: 0, pointerEvents: "none" }}
                onPointerMove={magnet}
                onPointerLeave={release}
              >
                <span className="hero-tag hero-tag-main">
                  {v.label} · {Math.round(v.w * v.d)} m²
                </span>
              </span>
            ))}
          </div>
        )}
        <div className="hero-fade" aria-hidden="true" />
        <div className="hero-fade hero-fade-right" aria-hidden="true" />
        <svg className="hero-ring" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="16" pathLength={1} className="hero-ring-track" />
          <circle cx="20" cy="20" r="16" pathLength={1} className="hero-ring-fill" ref={ring} />
        </svg>
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
            <span className="hero-pill" aria-hidden="true" style={pillStyle} />
          </ol>
        </div>
      </div>
    </section>
  );
}
