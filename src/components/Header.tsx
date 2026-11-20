"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { lockScroll } from "@/lib/scroll";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // the header reads its colour from what is under it: dark over ink sections, light elsewhere
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const y = 32;
      const over = Array.from(document.querySelectorAll<HTMLElement>(".ink")).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= y && r.bottom >= y;
      });
      setDark(over);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const t = window.setTimeout(check, 400); // after a page transition settles
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);
  const isCurrent = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

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
  }

  return (
    <>
      <header className="site-header" data-theme={dark || open ? "dark" : "light"}>
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
              <li key={n.href} style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}>
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
            Začít projekt <span className="arrow">→</span>
          </Link>
          <p className="label">{site.email}</p>
        </div>
      </div>
    </>
  );
}
