"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  REGIONS,
  STATUSES,
  TYPES,
  type Project,
  type ProjectStatus,
  type ProjectType,
} from "@/content/schema";
import type { MapSceneHandle } from "./MapScene";
import { CardBody } from "./CardBody";
import { CzMapSvg } from "./CzMapSvg";
import { gsap, prefersReducedMotion } from "@/lib/motion";

const MapScene = dynamic(() => import("./MapScene"), {
  ssr: false,
  loading: () => null,
});

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
const noopSubscribe = () => () => {};

export function MapExplorer({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const type = params.get("typ") as ProjectType | null;
  const status = params.get("stav") as ProjectStatus | null;

  const gl = useSyncExternalStore(noopSubscribe, hasWebGL, () => null);
  const [hovered, setHoveredState] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(params.get("projekt"));
  const [cardSlug, setCardSlug] = useState<string | null>(params.get("projekt"));
  const scene = useRef<MapSceneHandle>(null);
  const card = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const shown = useRef(false);

  const setHovered = useCallback((slug: string | null) => {
    setHoveredState(slug);
    if (slug) setCardSlug(slug);
  }, []);

  const visible = useMemo(
    () =>
      new Set(
        projects
          .filter((p) => (!type || p.type === type) && (!status || p.status === status))
          .map((p) => p.slug),
      ),
    [projects, type, status],
  );

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const focus = hovered ?? selected;

  // card content follows the focused pin; keep the last one during the exit animation
  useEffect(() => {
    const el = card.current;
    if (focus) {
      if (el && !shown.current) {
        shown.current = true;
        gsap.fromTo(
          el,
          { autoAlpha: 0, scale: 0.95 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: prefersReducedMotion() ? 0 : 0.18,
            ease: "power2.out",
          },
        );
      }
    } else if (el && shown.current) {
      shown.current = false;
      gsap.to(el, {
        autoAlpha: 0,
        scale: 0.95,
        duration: prefersReducedMotion() ? 0 : 0.14,
        ease: "power2.in",
        onComplete: () => setCardSlug(null),
      });
    }
  }, [focus]);

  const select = useCallback(
    (slug: string) => {
      if (selected === slug) {
        router.push(`/projekty/${slug}`);
        return;
      }
      setSelected(slug);
      setCardSlug(slug);
      scene.current?.flyTo(slug);
    },
    [selected, router],
  );

  const close = () => {
    setSelected(null);
    setHovered(null);
    scene.current?.reset();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // position the hover card next to the pin, inside the stage
  const onAnchor = useCallback(
    (x: number, y: number, ok: boolean) => {
      const el = card.current;
      const st = stage.current;
      if (!el || !st || selected) return; // a selected card is docked
      if (!ok) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const W = st.clientWidth;
      const H = st.clientHeight;
      let left = x + 22;
      let top = y - h - 16;
      if (left + w > W - 12) left = x - w - 22;
      if (top < 70) top = Math.min(H - h - 12, y + 24);
      el.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
    },
    [selected],
  );

  const current = projects.find((p) => p.slug === (focus ?? cardSlug));
  const byRegion = REGIONS.map((r) => ({
    region: r,
    items: projects.filter((p) => p.region === r),
  })).filter((g) => g.items.length);

  return (
    <div className="map-page">
      <div className="map-stage" ref={stage} data-lenis-prevent>
        <div className="map-hud">
          <h1>
            Kde
            <br />
            stavíme
          </h1>
          <div className="filters" role="group" aria-label="Filtrovat podle typu">
            <button
              type="button"
              className="chip"
              aria-pressed={!type}
              onClick={() => setParam("typ", null)}
            >
              Vše
            </button>
            {(Object.keys(TYPES) as ProjectType[]).map((t) => (
              <button
                key={t}
                type="button"
                className="chip"
                aria-pressed={type === t}
                onClick={() => setParam("typ", type === t ? null : t)}
              >
                {TYPES[t]}
              </button>
            ))}
          </div>
          <div
            className="filters"
            role="group"
            aria-label="Filtrovat podle stavu"
            style={{ marginTop: 8 }}
          >
            {(Object.keys(STATUSES) as ProjectStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                className="chip"
                aria-pressed={status === s}
                onClick={() => setParam("stav", status === s ? null : s)}
              >
                {STATUSES[s]}
              </button>
            ))}
          </div>
        </div>

        {gl === false && (
          <div style={{ position: "absolute", inset: "18% 4% 10%" }}>
            <CzMapSvg
              pins={projects.filter((p) => visible.has(p.slug))}
              highlight={focus ?? undefined}
              pinClassName="svg-pin"
              onPinProps={(slug) => ({
                tabIndex: 0,
                role: "button",
                "aria-label": projects.find((p) => p.slug === slug)?.name,
                onMouseEnter: () => setHovered(slug),
                onMouseLeave: () => setHovered(null),
                onClick: () => {
                  setSelected(slug);
                  setCardSlug(slug);
                },
              })}
            />
          </div>
        )}
        {gl && (
          <MapScene
            ref={scene}
            projects={projects}
            visible={visible}
            hovered={hovered}
            selected={selected}
            onHover={setHovered}
            onSelect={select}
            onAnchor={onAnchor}
            onReady={() => {
              const initial = params.get("projekt");
              if (initial) setTimeout(() => scene.current?.flyTo(initial), 1500);
            }}
          />
        )}

        <div className="map-legend label" aria-label="Legenda">
          <span className="status-chip" data-status="realizace">
            Realizováno
          </span>
          <span className="status-chip" data-status="vystavba">
            Ve výstavbě
          </span>
          <span className="status-chip" data-status="soutez">
            Soutěž
          </span>
          <span>Reliéf je stylizovaný</span>
        </div>
        {gl && (
          <div className="map-controls">
            <button type="button" onClick={() => scene.current?.zoom(1)} aria-label="Přiblížit">
              +
            </button>
            <button type="button" onClick={() => scene.current?.zoom(-1)} aria-label="Oddálit">
              −
            </button>
            <button type="button" onClick={close}>
              Výchozí pohled
            </button>
          </div>
        )}

        <div className="sheet-backdrop" data-open={selected ? "true" : "false"} onClick={close} />
        <div
          ref={card}
          className="map-card"
          data-docked={selected ? "true" : "false"}
          style={{ visibility: "hidden", opacity: 0 }}
          onMouseEnter={() => focus && setHovered(focus)}
          onMouseLeave={() => setHovered(null)}
          role={selected ? "dialog" : undefined}
          aria-label={current?.name}
        >
          {current && <CardBody p={current} onClose={selected ? close : undefined} />}
        </div>
      </div>

      <aside className="map-side" aria-label="Seznam projektů na mapě" data-lenis-prevent>
        <p className="label">
          {visible.size} {visible.size === 1 ? "stavba" : visible.size < 5 ? "stavby" : "staveb"} ·{" "}
          {new Set(projects.filter((p) => visible.has(p.slug)).map((p) => p.region)).size} krajů
        </p>
        {byRegion.map((g) => (
          <section key={g.region}>
            <h2 className="label">
              {g.region === "Praha"
                ? "Praha"
                : g.region === "Vysočina"
                  ? "Vysočina"
                  : `${g.region} kraj`}
            </h2>
            <ul>
              {g.items.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    className="item"
                    data-active={focus === p.slug}
                    data-dim={!visible.has(p.slug)}
                    disabled={!visible.has(p.slug)}
                    onMouseEnter={() => setHovered(p.slug)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(p.slug)}
                    onBlur={() => setHovered(null)}
                    onClick={() => select(p.slug)}
                  >
                    <span>{p.name}</span>
                    <span className="label">{p.municipality}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </aside>
    </div>
  );
}
