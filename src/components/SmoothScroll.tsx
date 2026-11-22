"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import { freezeScroll, pinTop, scrollToTop, setLenis } from "@/lib/scroll";

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

  // every arrival on a new page (any pathname change, also within /projekty): start at the very
  // top before the first paint, then lift the veil and let the page rise in
  const pathname = usePathname();
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    pinTop();
    const root = document.documentElement;
    if (prefersReducedMotion()) {
      delete root.dataset.leaving;
      return;
    }
    const t = window.setTimeout(() => delete root.dataset.leaving, 120);
    document.querySelector<HTMLElement>(".page")?.animate(
      [
        { opacity: 0, transform: "translateY(32px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 900, delay: 120, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
    );
    return () => window.clearTimeout(t);
  }, [pathname]);

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
      // freeze the page where it is: no wheel momentum may carry on into the next page
      freezeScroll();
      // we place the new page at the top ourselves (the pathname effect above), not the router
      window.setTimeout(() => router.push(target, { scroll: false }), 420);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return null;
}
