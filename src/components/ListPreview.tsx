"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/content/schema";
import { Axo } from "./Axo";
import { regionLabel } from "@/lib/format";

/**
 * A small picture of the hovered project that follows the cursor with a soft lag (mouse only).
 * Every project is pre-rendered once; hovering only swaps which one is visible.
 */
export function ListPreview({ projects, active }: { projects: Project[]; active: string | null }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let first = true;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (first) {
        x = tx;
        y = ty;
        first = false;
      }
      if (!raf) raf = requestAnimationFrame(step);
    };
    const step = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.transform = `translate3d(${(x + 28).toFixed(1)}px, ${(y - 90).toFixed(1)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(step) : 0;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="list-preview" ref={box} data-show={!!active} aria-hidden="true">
      {projects.map((p) => (
        <figure key={p.slug} data-on={active === p.slug}>
          <Axo massing={p.massing} aspect={4 / 3} pad={0.2} />
          <figcaption>
            {p.municipality} · {regionLabel(p.region)}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
