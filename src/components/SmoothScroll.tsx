"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import { scrollToTop, setLenis } from "@/lib/scroll";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Lenis smooth scroll driven by GSAP's ticker (off for reduced motion, never snaps or locks), plus
 * page transitions: internal links fade the page out, then navigate; the next page fades in at the top.
 * A link to the page you are already on scrolls smoothly back to the top.
 */
export function SmoothScroll() {
  const router = useRouter();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (BASE && !url.pathname.startsWith(BASE)) return;
      const path = url.pathname.slice(BASE.length) || "/";
      const here = window.location.pathname.slice(BASE.length) || "/";
      const norm = (p: string) => p.replace(/\/$/, "") || "/";
      if (url.hash && norm(path) === norm(here)) return; // in-page anchor
      e.preventDefault();
      if (norm(path) === norm(here) && url.search === window.location.search) {
        scrollToTop(false);
        return;
      }
      const target = `${path}${url.search}${url.hash}`;
      if (prefersReducedMotion()) {
        router.push(target);
        return;
      }
      document.documentElement.dataset.leaving = "true";
      window.setTimeout(() => router.push(target), 420);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return null;
}
