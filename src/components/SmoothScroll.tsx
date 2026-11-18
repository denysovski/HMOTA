"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/** Lenis smooth scroll driven by GSAP's ticker. Off for reduced motion. Never snaps or locks. */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // let maps and panels scroll natively
    const stop = (e: Event) => e.stopPropagation();
    document
      .querySelectorAll("[data-lenis-prevent]")
      .forEach((n) => n.addEventListener("wheel", stop));
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}
