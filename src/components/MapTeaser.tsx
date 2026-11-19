"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/content/schema";
import { CzMapSvg } from "./map/CzMapSvg";

/** Static map of Czechia on the home page. Pins drop in once when it scrolls into view. */
export function MapTeaser({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
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
  const order = new Map(projects.map((p, i) => [p.slug, i]));
  return (
    <div ref={ref} className="teaser-map" data-in={inView}>
      <CzMapSvg
        pins={projects}
        pinClassName="teaser-pin"
        onPinProps={(slug) => ({
          style: { animationDelay: `${Math.min((order.get(slug) ?? 0) * 40, 600)}ms` },
        })}
      />
    </div>
  );
}
