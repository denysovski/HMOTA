"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const isCurrent = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label={`${site.name}, úvodní stránka`}>
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
    </header>
  );
}
