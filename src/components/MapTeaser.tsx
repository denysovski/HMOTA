"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/content/schema";
import { CzMapSvg } from "./map/CzMapSvg";
import { svgMap } from "@/lib/geo";
import { area, duration, statusLabel, year } from "@/lib/format";
import { Arrow } from "@/components/Arrow";

const W = 1000;
const H = 620;

/**
 * Flat map of Czechia on the home page. Pins drop in once; hovering, focusing or tapping a pin
 * opens a bubble with who commissioned it, who designed it, its area and dates.
 */
export function MapTeaser({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // close on Escape or a tap outside
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const down = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", down);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", down);
    };
  }, []);

  const show = (slug: string) => {
    window.clearTimeout(closeTimer.current);
    setOpen(slug);
    setShown(slug);
  };
  const hideSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(null), 140);
  };

  const m = svgMap(W, H, 20);
  // spread pins that sit too close together (Praha has two) so each has its own target
  const offsets: Record<string, number> = {};
  const placed: { slug: string; x: number; y: number }[] = [];
  for (const q of projects) {
    const [x, y] = m.point(q.lng, q.lat);
    let dx = 0;
    for (const o of placed) {
      if (Math.abs(o.y - y) < 30 && Math.abs(o.x + (offsets[o.slug] ?? 0) - (x + dx)) < 30) {
        dx = (offsets[o.slug] ?? 0) + (x >= o.x ? 30 : -30) - (x - o.x);
      }
    }
    offsets[q.slug] = dx;
    placed.push({ slug: q.slug, x, y });
  }
  const order = new Map(projects.map((p, i) => [p.slug, i]));
  const p = projects.find((q) => q.slug === shown);
  const pos = p ? m.point(p.lng, p.lat) : [0, 0];
  const left = ((pos[0]! + (p ? (offsets[p.slug] ?? 0) : 0)) / W) * 100;
  const top = (pos[1]! / H) * 100;
  const flip = left > 58;

  return (
    <div ref={ref} className="teaser-map" data-in={inView}>
      <CzMapSvg
        pins={projects}
        highlight={open ?? undefined}
        pinClassName="teaser-pin"
        offsets={offsets}
        onPinProps={(slug) => ({
          style: { animationDelay: `${Math.min((order.get(slug) ?? 0) * 40, 600)}ms` },
        })}
      />
      {projects.map((q) => {
        const [x, y] = m.point(q.lng, q.lat);
        return (
          <button
            key={q.slug}
            type="button"
            className="teaser-hit"
            style={{
              left: `${((x + (offsets[q.slug] ?? 0)) / W) * 100}%`,
              top: `${((y - 26) / H) * 100}%`,
            }}
            aria-label={`${q.name}, ${q.municipality}`}
            aria-expanded={open === q.slug}
            onPointerEnter={(e) => e.pointerType === "mouse" && show(q.slug)}
            onPointerLeave={(e) => e.pointerType === "mouse" && hideSoon()}
            onFocus={() => show(q.slug)}
            onBlur={hideSoon}
            onClick={() => (open === q.slug ? setOpen(null) : show(q.slug))}
          />
        );
      })}
      <div
        className="teaser-bubble"
        data-open={!!open}
        data-flip={flip}
        role="dialog"
        aria-hidden={!open}
        style={{ left: `${left}%`, top: `${top}%` }}
        onPointerEnter={() => open && show(open)}
        onPointerLeave={hideSoon}
      >
        {p && (
          <>
            <p className="teaser-bubble-top">
              <span className="status-chip" data-status={p.status}>
                {statusLabel(p)}
              </span>
              <span className="num">{year(p)}</span>
            </p>
            <p className="teaser-bubble-name">{p.name}</p>
            <dl>
              <dt>Investor</dt>
              <dd>{p.client}</dd>
              <dt>Navrhli</dt>
              <dd>{p.architects.map((a) => a.name).join(", ")}</dd>
              <dt>Plocha</dt>
              <dd className="num">{area(p.areaM2)}</dd>
              <dt>Doba</dt>
              <dd className="num">{duration(p)}</dd>
              <dt>Místo</dt>
              <dd>{p.municipality}</dd>
            </dl>
            <Link
              href={`/projekty/${p.slug}`}
              className="teaser-bubble-link"
              tabIndex={open ? 0 : -1}
            >
              Detail projektu <Arrow />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
