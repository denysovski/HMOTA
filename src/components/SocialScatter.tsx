import { BINANCE, INSTAGRAM, X } from "./social-paths";

// LinkedIn is no longer in Simple Icons, so its mark is drawn here as a plain "in"
const LINKEDIN =
  "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.85h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.29h-4V9.75Z";

// sizes differ on purpose: Binance biggest, then Instagram, X, and LinkedIn the smallest
const ITEMS = [
  {
    label: "Binance",
    href: "https://www.binance.com/",
    d: BINANCE,
    left: "62%",
    top: "calc(74% - 150px)",
    size: 300,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    d: INSTAGRAM,
    left: "42%",
    top: "8%",
    size: 200,
  },
  { label: "X (Twitter)", href: "https://x.com/", d: X, left: "93%", top: "30%", size: 140 },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    d: LINKEDIN,
    left: "8%",
    top: "52%",
    size: 80,
  },
];

/** Social and investing links scattered in the gaps of the team grid (desktop only). */
export function SocialScatter() {
  return (
    <div className="social-scatter">
      {ITEMS.map((it, i) => (
        <a
          key={it.label}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-dot"
          style={{
            left: it.left,
            top: it.top,
            width: it.size,
            height: it.size,
            ["--i" as string]: i,
          }}
          aria-label={it.label}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={it.d} fill="currentColor" />
          </svg>
        </a>
      ))}
    </div>
  );
}
