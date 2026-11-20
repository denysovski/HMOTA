"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
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
import { area, duration, monthYear, regionLabel } from "@/lib/format";

const MapScene = dynamic(() => import("./MapScene"), { ssr: false, loading: () => null });

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

function subscribeNarrow(cb: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const isNarrow = () => window.matchMedia("(max-width: 767px)").matches;

export function MapExplorer({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const type = params.get("typ") as ProjectType | null;
  const status = params.get("stav") as ProjectStatus | null;

  const gl = useSyncExternalStore(noopSubscribe, hasWebGL, () => null);
  const narrow = useSyncExternalStore(subscribeNarrow, isNarrow, () => false);
  const [ready, setReady] = useState(false);
  const [hovered, setHoveredState] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(params.get("projekt"));
  const [cardSlug, setCardSlug] = useState<string | null>(params.get("projekt"));
  const [expanded, setExpanded] = useState<string | null>(null);
  const scene = useRef<MapSceneHandle>(null);
  const pos = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

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

  const setHovered = useCallback((slug: string | null) => {
    setHoveredState(slug);
    if (slug) setCardSlug(slug);
  }, []);

  // on touch screens a hover never happens: the card opens on tap (select) only
  const focus = narrow ? selected : (hovered ?? selected);
  const focusRef = useRef<string | null>(null);
  useEffect(() => {
    focusRef.current = focus;
    const el = card.current;
    if (!el) return;
    if (!focus) el.dataset.show = "false";
    else if (selected) el.dataset.show = "true"; // docked card or bottom sheet: no anchor needed
    // a floating card is shown by onAnchor once it has been positioned next to its pin
  }, [focus, selected]);

  const select = useCallback(
    (slug: string) => {
      if (selected === slug && !narrow) {
        router.push(`/projekty/${slug}`);
        return;
      }
      setSelected(slug);
      setCardSlug(slug);
      scene.current?.flyTo(slug);
    },
    [selected, router, narrow],
  );

  const close = useCallback(() => {
    setSelected(null);
    setHoveredState(null);
    scene.current?.reset();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // place the floating card next to its pin, inside the stage; called every frame by the scene
  const onAnchor = useCallback(
    (x: number, y: number, ok: boolean) => {
      const p = pos.current;
      const el = card.current;
      const st = stage.current;
      if (!p || !el || !st || selected || narrow || !focusRef.current) return;
      if (!ok) {
        el.dataset.show = "false";
        return;
      }
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const W = st.clientWidth;
      const H = st.clientHeight;
      let left = x + 22;
      let top = y - h - 16;
      let ox = "0%";
      let oy = "100%";
      if (left + w > W - 12) {
        left = x - w - 22;
        ox = "100%";
      }
      if (top < 84) {
        top = Math.min(H - h - 12, y + 24);
        oy = "0%";
      }
      p.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
      el.style.transformOrigin = `${ox} ${oy}`;
      el.dataset.show = "true";
    },
    [selected, narrow],
  );

  const current = projects.find((p) => p.slug === (focus ?? cardSlug));
  const byRegion = REGIONS.map((r) => ({
    region: r,
    items: projects.filter((p) => p.region === r),
  })).filter((g) => g.items.length);

  const onItem = (slug: string) => {
    if (narrow) {
      // phones: unfold the row in the list (tap again to fold it) and fly the map to the site
      setExpanded((e) => (e === slug ? null : slug));
      scene.current?.flyTo(slug);
      return;
    }
    select(slug);
  };

  const showLoader = gl !== false && !ready;

  return (
    <div className="map-page">
      <div className="map-stage" ref={stage} data-lenis-prevent>
        <div className="map-loader" data-done={!showLoader} aria-hidden={!showLoader}>
          <div className="map-loader-inner">
            <span className="map-loader-bar" />
            <p className="label">Stavíme model republiky…</p>
          </div>
        </div>
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
              onPinProps={(slug) => ({
                tabIndex: 0,
                role: "button",
                "aria-label": projects.find((p) => p.slug === slug)?.name,
                onClick: () => select(slug),
              })}
            />
          </div>
        )}
        {gl && (
          <MapScene
            ref={scene}
            projects={projects}
            visible={visible}
            hovered={narrow ? null : hovered}
            selected={selected}
            onHover={narrow ? () => {} : setHovered}
            onSelect={select}
            onAnchor={onAnchor}
            onReady={() => {
              setReady(true);
              const initial = params.get("projekt");
              if (initial) setTimeout(() => scene.current?.flyTo(initial), 1200);
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
        <div ref={pos} className="map-card-pos" data-docked={selected ? "true" : "false"}>
          <div
            ref={card}
            className="map-card"
            data-show="false"
            onMouseEnter={() => !narrow && focusRef.current && setHovered(focusRef.current)}
            onMouseLeave={() => !narrow && setHovered(null)}
            role={selected ? "dialog" : undefined}
            aria-label={current?.name}
          >
            {narrow && <span className="sheet-grip" aria-hidden="true" />}
            {current && <CardBody p={current} onClose={selected ? close : undefined} />}
          </div>
        </div>
      </div>

      <aside className="map-side" aria-label="Seznam projektů na mapě" data-lenis-prevent>
        <div className="map-side-head">
          <p className="label">
            {visible.size} {visible.size === 1 ? "stavba" : visible.size < 5 ? "stavby" : "staveb"}{" "}
            · {new Set(projects.filter((p) => visible.has(p.slug)).map((p) => p.region)).size} krajů
          </p>
        </div>
        {byRegion.map((g) => (
          <section key={g.region}>
            <h2 className="label">{regionLabel(g.region)}</h2>
            <ul>
              {g.items.map((p) => {
                const open = narrow && expanded === p.slug;
                return (
                  <li key={p.slug} className="side-item" data-open={open}>
                    <button
                      type="button"
                      className="item"
                      data-active={focus === p.slug || open}
                      data-dim={!visible.has(p.slug)}
                      disabled={!visible.has(p.slug)}
                      aria-expanded={narrow ? open : undefined}
                      onMouseEnter={() => !narrow && setHovered(p.slug)}
                      onMouseLeave={() => !narrow && setHovered(null)}
                      onFocus={() => !narrow && setHovered(p.slug)}
                      onBlur={() => !narrow && setHovered(null)}
                      onClick={() => onItem(p.slug)}
                    >
                      <span>{p.name}</span>
                      <span className="label">{p.municipality}</span>
                      <span className="item-chevron" aria-hidden="true" />
                    </button>
                    <div className="side-detail" aria-hidden={!open}>
                      <div>
                        <dl>
                          <dt>Investor</dt>
                          <dd>{p.client}</dd>
                          <dt>Navrhli</dt>
                          <dd>{p.architects.map((a) => a.name).join(", ")}</dd>
                          <dt>Zakázka</dt>
                          <dd className="num">
                            {monthYear(p.commissioned)} –{" "}
                            {p.completed ? monthYear(p.completed) : "dosud"}
                          </dd>
                          <dt>Doba</dt>
                          <dd className="num">{duration(p)}</dd>
                          <dt>Plocha</dt>
                          <dd className="num">{area(p.areaM2)}</dd>
                        </dl>
                        <Link href={`/projekty/${p.slug}`} className="u" tabIndex={open ? 0 : -1}>
                          Detail projektu <span className="arrow">→</span>
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </aside>
    </div>
  );
}
