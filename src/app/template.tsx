"use client";

import { useEffect, useRef } from "react";
import { scrollToTop } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";

let firstLoad = true;

/** Runs on every navigation: start at the top and fade the new page in (not on the first load). */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (firstLoad) {
      firstLoad = false;
      return;
    }
    scrollToTop(true);
    const root = document.documentElement;
    delete root.dataset.leaving;
    if (prefersReducedMotion()) return;
    ref.current?.animate(
      [
        { opacity: 0, transform: "translateY(28px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 750, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, []);
  return (
    <div ref={ref} className="page">
      {children}
    </div>
  );
}
