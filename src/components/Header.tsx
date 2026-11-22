"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { lockScroll } from "@/lib/scroll";
import { Arrow } from "@/components/Arrow";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // the bar slides away while scrolling down and comes back on the way up (always at the top)
  useEffect(() => {
    // Lenis eases every wheel tick into many small per-frame steps, so a slow scroll never
    // moves more than a few pixels between two checks. Measure the distance travelled since the
    // direction last changed instead of the step between frames.
    let last = window.scrollY;
    let anchor = last;
    let dir = 0;
    let raf = 0;
    const root = document.documentElement;
    const check = () => {
      raf = 0;
      const y = window.scrollY;
      // over the landing scene (home): no backdrop, always shown; past it: white, hides going down
      const hero = document.querySelector<HTMLElement>(".hero");
      const overHero = !!hero && y < hero.offsetTop + hero.offsetHeight - 80;
      if (overHero) root.dataset.heroIntro = "true";
      else delete root.dataset.heroIntro;
      const d = Math.sign(y - last);
      if (d !== 0 && d !== dir) {
        dir = d;
        anchor = last;
      }
      last = y;
      if (y < 80 || overHero) setHidden(false);
      else if (dir > 0 && y - anchor > 24) setHidden(true);
      else if (dir < 0 && anchor - y > 12) setHidden(false);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    check();
    const late = window.setTimeout(check, 200); // the next page's hero may mount a moment later
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
    };
  }, [pathname]);
  // while the next page loads, the clicked link already counts as current (one underline only)
  const [pending, setPending] = useState<string | null>(null);
  const here = pending ?? pathname;
  const isCurrent = (href: string) => (href === "/" ? here === "/" : here.startsWith(href));

  useEffect(() => {
    lockScroll(open);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      lockScroll(false);
    };
  }, [open]);

  // close the menu after navigating
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setPending(null);
  }

  return (
    <>
      <header className="site-header" data-theme="light" data-hidden={hidden && !open}>
        <Link href="/" className="wordmark">
          {site.wordmark.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </Link>
        <nav className="site-nav" aria-label="Hlavní navigace">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="u"
                  aria-current={isCurrent(n.href) ? "page" : undefined}
                  onClick={() => n.href !== pathname && setPending(n.href)}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className="burger"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Zavřít menu" : "Otevřít menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </header>
      <div id="mobile-menu" className="mobile-menu" data-open={open} aria-hidden={!open}>
        <nav aria-label="Menu">
          <ul>
            {nav.map((n, i) => (
              <li key={n.href} style={{ animationDelay: `${120 + i * 60}ms` }}>
                <Link
                  href={n.href}
                  tabIndex={open ? 0 : -1}
                  aria-current={isCurrent(n.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-menu-foot">
          <Link
            href="/kontakt"
            className="btn btn-lime"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            Začít projekt <Arrow />
          </Link>
          <p className="label">{site.email}</p>
        </div>
      </div>
    </>
  );
}
