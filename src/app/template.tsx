"use client";

import { useLayoutEffect, useRef } from "react";
import { scrollToTop } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";

let firstLoad = true;

/** Runs on every navigation: start at the top and fade the new page in (not on the first load). */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // layout effect: the new page is already at the top before it is first painted
  useLayoutEffect(() => {
    if (firstLoad) {
      firstLoad = false;
      return;
    }
    scrollToTop(true);
    window.scrollTo(0, 0);
    const root = document.documentElement;
    if (prefersReducedMotion()) {
      delete root.dataset.leaving;
      return;
    }
    // the veil lifts a beat later while the page rises in underneath it
    const t = window.setTimeout(() => delete root.dataset.leaving, 120);
    ref.current?.animate(
      [
        { opacity: 0, transform: "translateY(32px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 900, delay: 120, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
    );
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div ref={ref} className="page">
      {children}
    </div>
  );
}
