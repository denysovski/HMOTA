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
// start fetching the 3D as soon as this module runs, not after the page has hydrated
if (typeof window !== "undefined") void import("./HeroScene");

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** stills of the scene at 0 %, 10 % … 100 % of the scroll (scripts/hero-frames.py) */
const frameSrc = (kind: "d" | "m", i: number) =>
  `${BASE}/hero/${kind}${String(i).padStart(2, "0")}.webp`;
const FRAME_HTML = `<picture><source media="(max-width: 767px)" srcset="${frameSrc("m", 0)}"><img src="${frameSrc("d", 0)}" alt="" decoding="async" fetchpriority="high"></picture><script>(function(){try{history.scrollRestoration="manual"}catch(e){}var t=function(){window.__heroTouched=1};["wheel","touchmove","keydown"].forEach(function(e){addEventListener(e,t,{passive:true,once:true})});var s=document.currentScript,h=s.closest(".hero"),img=s.previousElementSibling.querySelector("img"),so=s.previousElementSibling.querySelector("source"),last=0;function u(){var span=h.offsetHeight-innerHeight;var p=Math.min(1,Math.max(0,(scrollY-h.offsetTop)/span));var i=Math.round(p*10);if(i===last)return;last=i;var n=(i<10?"0":"")+i;img.src="${BASE}/hero/d"+n+".webp";so.srcset="${BASE}/hero/m"+n+".webp"}addEventListener("scroll",u,{passive:true});u()})()</script>`;

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

// labels lean towards the cursor within a small radius; the scene springs label and line together
const PULL = 0.32;
const MAX = 16;
function aim(e: React.PointerEvent<HTMLElement>, kick: () => void) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const dx = Math.max(-MAX, Math.min(MAX, (e.clientX - (r.left + r.width / 2)) * PULL));
  const dy = Math.max(-MAX, Math.min(MAX, (e.clientY - (r.top + r.height / 2)) * PULL));
  el.dataset.mx = dx.toFixed(1);
  el.dataset.my = dy.toFixed(1);
  kick();
}
function rest(e: React.PointerEvent<HTMLElement>, kick: () => void) {
  e.currentTarget.dataset.mx = "0";
  e.currentTarget.dataset.my = "0";
  kick();
}

const MATERIAL_NOTE =
  "Brutalismus · pohledový beton z prkenného bednění, hrubý kartáčovaný beton, černá ocel, čiré sklo";

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
    // never pull back a visitor who already started scrolling while the page loaded
    if (!(window as Window & { __heroTouched?: number }).__heroTouched) window.scrollTo(0, 0);
    // load the 3D straight away (not "when idle": idle never comes while the visitor scrolls)
    if (isStill()) return;
    void import("./HeroScene");
    // warm the stills too (~25 kB each), so a fast scroll finds every one of them ready
    const kind = window.matchMedia("(max-width: 767px)").matches ? "m" : "d";
    const warm = window.setTimeout(() => {
      for (let i = 1; i <= 10; i++) new Image().src = frameSrc(kind, i);
    }, 300);
    const raf = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(warm);
    };
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
        {!still && (
          // while the 3D loads, a still of the scene at the current scroll point stands in for
          // it, so scrolling straight away never shows an empty screen; the canvas fades in over it
          <div
            className="hero-frame"
            data-ready={ready}
            // React never touches the inside: the inline script swaps the still from first paint,
            // long before the page's JavaScript (and the 3D) have loaded
            dangerouslySetInnerHTML={{ __html: FRAME_HTML }}
          />
        )}
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
                onPointerMove={(e) => aim(e, () => kick.current?.())}
                onPointerLeave={(e) => rest(e, () => kick.current?.())}
              >
                <span className="hero-tag hero-tag-main" data-variant={k === 0 ? "lime" : "ink"}>
                  {v.label} · {Math.round(v.w * v.d)} m²
                </span>
              </span>
            ))}
            <span
              ref={(el) => {
                labels.current[named.length] = el;
              }}
              className="hero-tag-anchor"
              style={{ opacity: 0, pointerEvents: "none" }}
            >
              <span className="hero-tag hero-tag-main hero-tag-spec">{MATERIAL_NOTE}</span>
            </span>
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
