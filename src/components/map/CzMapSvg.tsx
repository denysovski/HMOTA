import type { Project } from "@/content/schema";
import { geo, svgMap } from "@/lib/geo";

interface Props {
  width?: number;
  height?: number;
  pins?: Pick<Project, "slug" | "name" | "lat" | "lng" | "status">[];
  highlight?: string;
  showCities?: boolean;
  className?: string;
  title?: string;
  /** render each pin as a button (used by the no-WebGL fallback) */
  onPinProps?: (slug: string) => Record<string, unknown>;
  pinClassName?: string;
  /** horizontal nudge per pin (px in the 1000-wide frame) so close pins do not overlap */
  offsets?: Record<string, number>;
}

/** Flat map of Czechia: border, regions, rivers, cities and project pins. */
export function CzMapSvg({
  width = 1000,
  height = 620,
  pins = [],
  highlight,
  showCities = true,
  className,
  title = "Mapa České republiky s projekty ateliéru",
  onPinProps,
  pinClassName,
  offsets = {},
}: Props) {
  const m = svgMap(width, height, 20);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} role="img" aria-label={title}>
      <path d={m.ringPath(geo.border)} fill="#f6f6f4" stroke="#0a0a0a" strokeWidth={1.2} />
      <g fill="none" stroke="#0a0a0a" strokeOpacity={0.16} strokeWidth={0.8}>
        {geo.regions.map((r) => (
          <path key={r.name} d={m.ringPath(r.ring)} />
        ))}
      </g>
      <g fill="none" stroke="#8a9aa0" strokeWidth={0.9}>
        {geo.rivers.map((r, i) => (
          <path key={i} d={m.linePath(r.line)} />
        ))}
      </g>
      {showCities && (
        <g fontSize={11} fontFamily="var(--font-sans)" fill="#5e5e5e" letterSpacing="0.06em">
          {geo.cities.slice(0, 8).map((c) => {
            const [x, y] = m.point(c.lon, c.lat);
            return (
              <g key={c.name}>
                <circle cx={x} cy={y} r={1.8} fill="#5e5e5e" />
                <text x={x + 6} y={y + 4}>
                  {c.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>
      )}
      <g>
        {pins.map((p) => {
          const [x, y] = m.point(p.lng, p.lat);
          const on = highlight === p.slug;
          const r = on ? 8.5 : 6;
          const fill = p.status === "realizace" ? "#c8ff2e" : "#ffffff";
          const stroke = p.status === "vystavba" ? "#c8ff2e" : "#0a0a0a";
          return (
            <g key={p.slug} className={pinClassName} {...(onPinProps ? onPinProps(p.slug) : {})}>
              <line
                x1={x}
                y1={y}
                x2={x + (offsets[p.slug] ?? 0)}
                y2={y - 20}
                stroke="#0a0a0a"
                strokeWidth={1}
              />
              <circle
                cx={x + (offsets[p.slug] ?? 0)}
                cy={y - 20 - r}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeOpacity={p.status === "soutez" ? 1 : 0.6}
                strokeWidth={p.status === "vystavba" ? 2.4 : 1}
                style={{ transition: "r 250ms" }}
              />
              <title>{p.name}</title>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
