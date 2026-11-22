import Link from "next/link";
import { nav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer ink">
      <div className="wrap">
        <div className="grid footer-cols">
          <div style={{ gridColumn: "span 3" }}>
            <h2 className="label">Navigace</h2>
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <Link className="u" href={n.href}>
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="u" href="/kontakt">
                  Začít projekt
                </Link>
              </li>
            </ul>
          </div>
          <div style={{ gridColumn: "span 3" }}>
            <h2 className="label">Kontakt</h2>
            <ul>
              <li>
                <a className="u" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </li>
              <li className="num">{site.phone}</li>
              {site.social.map((s) => (
                <li key={s.label}>
                  <a className="u" href={s.href} rel="noopener noreferrer" target="_blank">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ gridColumn: "span 3" }}>
            <h2 className="label">Adresa</h2>
            <address style={{ fontStyle: "normal" }}>
              <ul>
                {site.address.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </address>
          </div>
          <div style={{ gridColumn: "span 3" }}>
            <h2 className="label">Otevírací doba</h2>
            <ul>
              {site.hours.map(([d, h]) => (
                <li key={d} className="num">
                  {d} {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="footer-word" aria-hidden="true">
          {site.name}
        </p>
        <div className="footer-legal label">
          <span className="demo-info">
            {/* the demo note lives in a bubble: hover, focus or tap the "i" */}
            <button type="button" className="demo-info-btn" aria-describedby="demo-note">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.6}
                aria-hidden="true"
              >
                <path d="M12 10.5v7" strokeLinecap="round" />
                <circle cx="12" cy="6.6" r="1.6" fill="currentColor" stroke="none" />
              </svg>
              <span className="sr-only">Demo stránka</span>
            </button>
            <span className="demo-tip" role="tooltip" id="demo-note">
              {site.demoNote}
            </span>
          </span>
          <span>
            © {new Date().getFullYear()} {site.legalName} · IČO {site.ico}
          </span>
          <span>
            <Link className="u" href="/ochrana-soukromi">
              Ochrana soukromí
            </Link>{" "}
            ·{" "}
            <Link className="u" href="/impressum">
              Impressum
            </Link>
          </span>
          <span>Mapové podklady: Natural Earth</span>
        </div>
      </div>
    </footer>
  );
}
