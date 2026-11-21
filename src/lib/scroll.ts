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

/** stop smooth scrolling immediately (kills momentum); the next scrollToTop starts it again */
export function freezeScroll() {
  if (!instance) return;
  instance.scrollTo(instance.scroll, { immediate: true, force: true });
  instance.stop();
}

/** put a freshly mounted page at the very top, and keep it there for its first frames */
export function pinTop() {
  const top = () => {
    if (instance) {
      instance.start();
      instance.scrollTo(0, { immediate: true, force: true });
    }
    window.scrollTo(0, 0);
  };
  top();
  requestAnimationFrame(() => {
    top();
    requestAnimationFrame(top);
  });
  window.setTimeout(top, 160);
}

export function lockScroll(lock: boolean) {
  if (instance) {
    if (lock) instance.stop();
    else instance.start();
  }
  // no overflow toggling on <html>: on phones that makes the page (and the menu) jump
  document.documentElement.dataset.locked = lock ? "true" : "";
}
