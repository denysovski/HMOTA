"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";

/** Magnetic pull for the primary action only. The label moves a little more than the button. */
export function Magnetic({
  children,
  strength = 0.28,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
      const target = el.firstElementChild as HTMLElement | null;
      if (!target) return;
      const x = gsap.quickTo(target, "x", { duration: 0.6, ease: "power3.out" });
      const y = gsap.quickTo(target, "y", { duration: 0.6, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * strength);
        y((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        x(0);
        y(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );
  return (
    <span ref={ref} style={{ display: "inline-block", padding: 18, margin: -18 }}>
      {children}
    </span>
  );
}
