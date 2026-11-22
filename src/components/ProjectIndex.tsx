"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import {
  STATUSES,
  TYPES,
  type Project,
  type ProjectStatus,
  type ProjectType,
} from "@/content/schema";
import { ScatterGrid } from "./ScatterGrid";
import { area, statusLabel, typeLabel, year } from "@/lib/format";
import { Arrow } from "@/components/Arrow";
import { ListPreview } from "./ListPreview";
import { prefersReducedMotion } from "@/lib/motion";

const EVENT = "hmota:query";

function subscribe(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/** Update the query string in place (Next keeps its router in sync with history.replaceState). */
function setQuery(next: URLSearchParams) {
  const qs = next.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  window.dispatchEvent(new Event(EVENT));
}

export function ProjectIndex({ projects }: { projects: Project[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  const params = new URLSearchParams(search);
  const type = params.get("typ") as ProjectType | null;
  const status = params.get("stav") as ProjectStatus | null;
  const view = params.get("pohled") === "seznam" ? "seznam" : "mrizka";

  // filtering: the shown cards fade out, the set swaps, the new cards rise in one by one
  // out: the shown cards fade and drop; pre: the new set is placed, hidden, with no transition;
  // in: it fades and rises, one card after another. Plain transitions only: an animation that
  // is removed mid-way would make the fade-out jump instead of play.
  const [phase, setPhase] = useState<"in" | "out" | "pre">("in");
  const swap = useRef<number | undefined>(undefined);
  const change = (next: URLSearchParams) => {
    window.clearTimeout(swap.current);
    if (prefersReducedMotion()) {
      setQuery(next);
      return;
    }
    setPhase("out");
    swap.current = window.setTimeout(() => {
      setQuery(next);
      setPhase("pre");
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("in")));
    }, 260);
  };
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    change(next);
  };

  const list = projects.filter(
    (p) => (!type || p.type === type) && (!status || p.status === status),
  );
  const mapHref = `/mapa${params.toString() ? `?${new URLSearchParams([...params].filter(([k]) => k !== "pohled"))}` : ""}`;

  return (
    <>
      <div className="toolbar">
        <div className="filters" role="group" aria-label="Typ">
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
          <span aria-hidden="true" style={{ width: 12 }} />
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
        <div className="view-toggle" role="group" aria-label="Zobrazení">
          <button
            type="button"
            aria-pressed={view === "mrizka"}
            onClick={() => setParam("pohled", null)}
          >
            Mřížka
          </button>
          <button
            type="button"
            aria-pressed={view === "seznam"}
            onClick={() => setParam("pohled", "seznam")}
          >
            Seznam
          </button>
          <Link href={mapHref} className="arrow-link">
            Mapa <Arrow />
          </Link>
        </div>
      </div>
      <p
        className="label count"
        aria-live="polite"
        style={{ margin: "14px 0 clamp(40px, 5vw, 80px)" }}
      >
        Zobrazeno {list.length} z {projects.length}
      </p>
      <div className="swap" data-phase={phase}>
        {list.length === 0 ? (
          <div className="empty fitem" style={{ paddingBottom: "20vh" }}>
            <p className="statement">Tomuto výběru neodpovídá žádný projekt.</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => change(new URLSearchParams())}
            >
              Zrušit filtry
            </button>
          </div>
        ) : view === "mrizka" ? (
          <ScatterGrid items={list} reveal={false} />
        ) : (
          <ul className="plist" onMouseLeave={() => setHover(null)}>
            {list.map((p, i) => (
              <li key={p.slug} className="fitem" style={{ ["--i" as string]: i }}>
                <Link href={`/projekty/${p.slug}`} onMouseEnter={() => setHover(p.slug)}>
                  <span className="name">{p.name}</span>
                  <span>{p.municipality}</span>
                  <span className="muted">{typeLabel(p)}</span>
                  <span className="muted">{statusLabel(p)}</span>
                  <span className="num muted">{area(p.areaM2)}</span>
                  <span className="num muted">{year(p)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {view !== "mrizka" && list.length > 0 && <ListPreview projects={list} active={hover} />}
    </>
  );
}
