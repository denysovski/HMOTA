import Link from "next/link";
import { Arrow } from "./Arrow";

/** The open position, with a large drawn envelope: a letter that is waiting to be sent. */
export function Hiring() {
  return (
    <aside className="hiring" aria-labelledby="hiring-title">
      <div className="hiring-text">
        <p className="label">Volné místo</p>
        <h3 className="h2" id="hiring-title">
          Hledáme architekta nebo architektku do týmu soutěží.
        </h3>
        <p className="small muted">
          Dva až pět let praxe, radost z modelu i z výkresu a chuť pouštět se do soutěží. Pošlete
          portfolio do patnácti stran a pár vět o sobě.
        </p>
        <Link href="/kontakt" className="btn btn-lime">
          Napište nám <Arrow />
        </Link>
      </div>
      <svg className="hiring-art" viewBox="0 0 420 320" aria-hidden="true">
        {/* shadow on the floor: stays level, shifted and widened under the tilted envelope */}
        <ellipse cx="226" cy="300" rx="162" ry="15" fill="#0a0a0a" opacity="0.08" />
        <ellipse cx="248" cy="298" rx="96" ry="9" fill="#0a0a0a" opacity="0.07" />
        {/* the envelope leans to the right */}
        <g transform="rotate(8 210 170)">
          {/* back of the envelope, opened */}
          <path
            d="M70 120 L210 30 L350 120 Z"
            fill="#c8ff2e"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* the letter sliding out */}
          <g className="hiring-letter">
            <rect
              x="100"
              y="64"
              width="220"
              height="150"
              fill="#ffffff"
              stroke="#0a0a0a"
              strokeWidth="2"
            />
            <path
              d="M124 96 H262 M124 116 H296 M124 136 H280 M124 156 H240"
              stroke="#0a0a0a"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
            <rect x="262" y="164" width="34" height="34" fill="#0a0a0a" />
            <path
              d="M268 190 L279 172 L290 190"
              fill="none"
              stroke="#c8ff2e"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
          {/* front pocket */}
          <path
            d="M70 120 L70 270 L350 270 L350 120 L210 205 Z"
            fill="#f4f4f1"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M70 270 L190 190 M350 270 L230 190"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* lime stamp */}
          <circle cx="318" cy="238" r="16" fill="#c8ff2e" stroke="#0a0a0a" strokeWidth="2" />
        </g>
      </svg>
    </aside>
  );
}
