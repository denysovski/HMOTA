"use client";

import type Lenis from "lenis";

/** the one Lenis instance (set by <SmoothScroll>); null when reduced motion turned it off */
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export function scrollToTop(immediate = false) {
  if (instance)
    instance.scrollTo(
      0,
      immediate ? { immediate: true, force: true } : { duration: 1.1, force: true },
    );
  else window.scrollTo({ top: 0, behavior: immediate ? "instant" : "smooth" });
}

export function lockScroll(lock: boolean) {
  if (instance) {
    if (lock) instance.stop();
    else instance.start();
  }
  document.documentElement.style.overflow = lock ? "hidden" : "";
}
