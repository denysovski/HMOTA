"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  STATUSES,
  TYPES,
  type Project,
  type ProjectStatus,
  type ProjectType,
} from "@/content/schema";
import { ScatterGrid } from "./ScatterGrid";
import { area, statusLabel, typeLabel, year } from "@/lib/format";

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
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  const params = new URLSearchParams(search);
  const type = params.get("typ") as ProjectType | null;
  const status = params.get("stav") as ProjectStatus | null;
  const view = params.get("pohled") === "seznam" ? "seznam" : "mrizka";

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    setQuery(next);
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
          <Link href={mapHref} className="u">
            Mapa →
          </Link>
        </div>
      </div>
      <p className="label" aria-live="polite" style={{ margin: "14px 0 clamp(40px, 5vw, 80px)" }}>
        Zobrazeno {list.length} z {projects.length}
      </p>
      {list.length === 0 ? (
        <p className="statement" style={{ paddingBottom: "20vh" }}>
          Tomuto výběru neodpovídá žádný projekt.{" "}
          <button
            type="button"
            className="u"
            onClick={() => setQuery(new URLSearchParams())}
          >
            Zrušit filtry
          </button>
        </p>
      ) : view === "mrizka" ? (
        <ScatterGrid key={`${type}-${status}`} items={list} />
      ) : (
        <ul className="plist">
          {list.map((p) => (
            <li key={p.slug}>
              <Link href={`/projekty/${p.slug}`}>
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
    </>
  );
}
