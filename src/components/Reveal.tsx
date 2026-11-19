"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/motion";

interface RevealProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  delay?: number;
  /** start when the element enters the viewport (default) or immediately */
  immediate?: boolean;
  id?: string;
}

/** Line-by-line mask reveal (Kononenko style). Plays once. Text stays real, selectable HTML. */
export function Reveal({
  as: Tag = "p",
  className,
  children,
  delay = 0,
  immediate,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        el.style.visibility = "visible";
        return;
      }
      let played = false;
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "reveal-line",
        autoSplit: true,
        // lines only wrap whole words, so screen readers can read the text as is
        aria: "none",
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          if (played) return;
          return gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.05,
            ease: "expo.out",
            stagger: 0.085,
            delay,
            onStart: () => {
              played = true;
            },
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={["reveal", className].filter(Boolean).join(" ")} id={id}>
      {children}
    </Tag>
  );
}
