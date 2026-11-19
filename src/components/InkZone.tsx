"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";

/** The page turns from paper to ink as this zone arrives. Without JS it is simply ink. */
export function InkZone({ children, id }: { children: ReactNode; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el,
        { backgroundColor: "#ffffff", color: "#0a0a0a" },
        {
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 75%", end: "top 15%", scrub: true },
        },
      );
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="ink" id={id}>
      {children}
    </div>
  );
}
