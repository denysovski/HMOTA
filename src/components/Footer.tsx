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
                <Link className="u" href="/kontakt#poptavka">
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
              <li>
                <a className="u" href={`tel:${site.phone.replace(/\s/g, "")}`}>
                  {site.phone}
                </a>
              </li>
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
          <span>
            © {new Date().getFullYear()} {site.name} · IČO {site.ico}
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
