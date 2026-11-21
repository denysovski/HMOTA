"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@/content/schema";
import { Axo } from "./Axo";
import { area, typeLabel, year } from "@/lib/format";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";

/** column start / span, top offset (vw) and aspect for each slot; the pattern repeats */
const SLOTS = [
  { col: "1 / span 5", mt: 0, aspect: 4 / 3 },
  { col: "8 / span 5", mt: 16, aspect: 3 / 2 },
  { col: "4 / span 4", mt: 2, aspect: 1 },
  { col: "9 / span 4", mt: 10, aspect: 4 / 5 },
  { col: "1 / span 4", mt: -6, aspect: 4 / 5 },
  { col: "6 / span 6", mt: 8, aspect: 16 / 10 },
];

export function ScatterGrid({ items }: { items: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const medias = gsap.utils.toArray<HTMLElement>(".scatter-media", ref.current);
      medias.forEach((m) => {
        gsap.fromTo(
          m,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: m, start: "top 90%", once: true },
          },
        );
        const art = m.querySelector("svg");
        if (art)
          gsap.fromTo(
            art,
            { yPercent: -4 },
            { yPercent: 4, ease: "none", scrollTrigger: { trigger: m, scrub: true } },
          );
      });
    },
    { scope: ref },
  );

  return (
    <div className="grid scatter" ref={ref}>
      {items.map((p, i) => {
        const s = SLOTS[i % SLOTS.length]!;
        return (
          <Link
            key={p.slug}
            href={`/projekty/${p.slug}`}
            className="scatter-item"
            style={{ gridColumn: s.col, marginTop: `${s.mt}vw` }}
          >
            <div className="scatter-media" style={{ aspectRatio: s.aspect }}>
              <Axo massing={p.massing} aspect={s.aspect} title={`Axonometrie: ${p.name}`} />
            </div>
            <div className="scatter-meta">
              <span className="scatter-title">
                {p.name} <span className="tag">· {p.municipality}</span>
              </span>
              <span className="num scatter-wide">{area(p.areaM2)}</span>
            </div>
            <div className="scatter-meta" style={{ marginTop: 2 }}>
              <span className="tag">{typeLabel(p)}</span>
              <span className="tag num scatter-wide">{year(p)}</span>
            </div>
            {/* phones: area and year move under the text as two small facts */}
            <div className="scatter-facts">
              <span className="num">{area(p.areaM2)}</span>
              <span className="num">{year(p)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
