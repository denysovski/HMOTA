"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";

interface Props {
  labels: string[];
  title: [string, string];
}

/** Hairline curves drawn on scroll from a centred headline out to named disciplines. */
export function RadialLines({ labels, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 1000 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      if (e) setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = labels.length;
  const { w, h } = size;
  const items = labels.map((label, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.18;
    const r = 0.44 + (i % 3) * 0.03;
    const px = (fx: number, fy: number) => [w * fx, h * fy] as const;
    const [x, y] = px(0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r * 0.92);
    const bend = 0.22 * (i % 2 ? 1 : -1);
    const [mx, my] = px(0.5 + Math.cos(a + bend) * r * 0.5, 0.5 + Math.sin(a + bend) * r * 0.46);
    const [sx, sy] = px(0.5 + Math.cos(a) * 0.12, 0.5 + Math.sin(a) * 0.09);
    return {
      label,
      left: (x / w) * 100,
      top: (y / h) * 100,
      d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`,
    };
  });

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const paths = Array.from(root.querySelectorAll<SVGPathElement>("path"));
      const tags = root.querySelectorAll(".radial-label");
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(tags, { autoAlpha: 0 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 70%", end: "center 45%", scrub: 0.6 },
      });
      tl.to(paths, { strokeDashoffset: 0, stagger: 0.05, ease: "none" }).to(
        tags,
        { autoAlpha: 1, stagger: 0.04, duration: 0.2 },
        "-=0.4",
      );
    },
    { scope: ref, dependencies: [w, h], revertOnUpdate: true },
  );

  return (
    <div className="radial" ref={ref}>
      <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        {items.map((it) => (
          <path
            key={it.label}
            d={it.d}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.55}
            strokeWidth={1}
          />
        ))}
      </svg>
      <div className="radial-title">
        <h2 className="h2">
          {title[0]}
          <br />
          {title[1]}
        </h2>
      </div>
      <ul aria-label="Disciplíny">
        {items.map((it) => (
          <li
            key={it.label}
            className="radial-label"
            style={{ left: `${it.left}%`, top: `${it.top}%` }}
          >
            {it.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
