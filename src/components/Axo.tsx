import type { Volume } from "@/content/schema";

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

type P = [number, number];
const iso = (x: number, y: number, z: number): P => [(x - z) * COS, (x + z) * SIN - y];
const pts = (ps: P[]) => ps.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

export interface AxoProps {
  massing: Volume[];
  /** "clay": filled drawing; "line": hairline only, like a sketch */
  variant?: "clay" | "line";
  /** frame aspect ratio (width / height); the drawing is centred inside */
  aspect?: number;
  /** padding around the drawing, as a share of its size */
  pad?: number;
  title?: string;
  className?: string;
  /** draw the site plan outline in lime under the building */
  plan?: boolean;
  /** loose notes placed beside a volume (offset as a share of the frame), no leader lines */
  notes?: { vol: number; text: string; dx?: number; dy?: number }[];
  /** a short line under the drawing that says what it shows */
  caption?: string;
}

/** Axonometric hairline drawing of a project's massing. Pure SVG, server-rendered. */
export function Axo({
  massing,
  variant = "clay",
  aspect = 3 / 2,
  pad = 0.18,
  title,
  className,
  plan = true,
  notes,
  caption,
}: AxoProps) {
  // centre the massing on the origin
  const minX = Math.min(...massing.map((v) => v.x));
  const minZ = Math.min(...massing.map((v) => v.z));
  const maxX = Math.max(...massing.map((v) => v.x + v.w));
  const maxZ = Math.max(...massing.map((v) => v.z + v.d));
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  const vols = massing
    .map((v, i) => ({ ...v, i, x: v.x - cx, z: v.z - cz }))
    .sort((a, b) => a.x + a.w + a.z + a.d + a.y - (b.x + b.w + b.z + b.d + b.y));

  // site: a plot around the footprint
  const sx = (maxX - minX) / 2 + Math.max(6, (maxX - minX) * 0.22);
  const sz = (maxZ - minZ) / 2 + Math.max(6, (maxZ - minZ) * 0.22);
  const site: P[] = [iso(-sx, 0, -sz), iso(sx, 0, -sz), iso(sx, 0, sz), iso(-sx, 0, sz)];

  const all: P[] = [...site];
  for (const v of vols) {
    const top = v.y + v.h;
    all.push(iso(v.x, top, v.z), iso(v.x + v.w, top, v.z + v.d), iso(v.x, top, v.z + v.d));
    all.push(iso(v.x + v.w, top, v.z));
  }
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  let x0 = Math.min(...xs);
  let x1 = Math.max(...xs);
  let y0 = Math.min(...ys);
  let y1 = Math.max(...ys);
  const w = x1 - x0;
  const h = y1 - y0;
  x0 -= w * pad;
  x1 += w * pad;
  y0 -= h * pad;
  y1 += h * pad;
  // fit to the requested aspect
  let vw = x1 - x0;
  let vh = y1 - y0;
  if (vw / vh < aspect) {
    const nw = vh * aspect;
    x0 -= (nw - vw) / 2;
    vw = nw;
  } else {
    const nh = vw / aspect;
    y0 -= (nh - vh) / 2;
    vh = nh;
  }

  const clay = variant === "clay";

  // callouts: anchor on the top of the volume, label offset outwards (viewBox units)
  const callouts = (notes ?? []).flatMap((n) => {
    const v = vols.find((q) => q.i === n.vol);
    if (!v) return [];
    const a = iso(v.x + v.w * 0.5, v.y + v.h * 0.5, v.z + v.d * 0.5);
    const l: P = [a[0] + (n.dx ?? 0.18) * vw, a[1] + (n.dy ?? -0.16) * vh];
    return [{ a, l, text: n.text, right: (n.dx ?? 0.18) >= 0 }];
  });
  // keep every note inside the frame: left-side notes grow leftwards, right-side ones rightwards
  const pct = (p: P, right: boolean) => {
    const x = ((p[0] - x0) / vw) * 100;
    return {
      left: `${right ? Math.min(x, 66) : Math.max(x, 34)}%`,
      top: `${Math.min(92, Math.max(6, ((p[1] - y0) / vh) * 100))}%`,
    };
  };
  const shadowDx = 0.35;

  const svg = (
    <svg
      viewBox={`${x0.toFixed(2)} ${y0.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        fill="none"
        stroke="#0a0a0a"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        style={{ vectorEffect: "non-scaling-stroke" }}
      >
        {/* site outline */}
        <polygon
          points={pts(site)}
          stroke="#0a0a0a"
          strokeOpacity={0.18}
          strokeDasharray="3 4"
          vectorEffect="non-scaling-stroke"
        />
        {/* ground shadows */}
        {clay &&
          vols
            .filter((v) => v.y === 0)
            .map((v, i) => {
              const l = v.h * shadowDx;
              return (
                <polygon
                  key={`s${i}`}
                  points={pts([
                    iso(v.x + v.w, 0, v.z),
                    iso(v.x + v.w + l, 0, v.z + l * 0.4),
                    iso(v.x + v.w + l, 0, v.z + v.d + l * 0.4),
                    iso(v.x + v.w, 0, v.z + v.d),
                  ])}
                  fill="#0a0a0a"
                  fillOpacity={0.06}
                  stroke="none"
                />
              );
            })}
        {/* plan outlines in lime */}
        {plan &&
          vols
            .filter((v) => v.y === 0)
            .map((v, i) => (
              <polygon
                key={`p${i}`}
                points={pts([
                  iso(v.x - 1.2, 0, v.z - 1.2),
                  iso(v.x + v.w + 1.2, 0, v.z - 1.2),
                  iso(v.x + v.w + 1.2, 0, v.z + v.d + 1.2),
                  iso(v.x - 1.2, 0, v.z + v.d + 1.2),
                ])}
                stroke="#c8ff2e"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
        {vols.map((v, i) => {
          const t = v.y + v.h;
          const b = v.y;
          const top: P[] = [
            iso(v.x, t, v.z),
            iso(v.x + v.w, t, v.z),
            iso(v.x + v.w, t, v.z + v.d),
            iso(v.x, t, v.z + v.d),
          ];
          const right: P[] = [
            iso(v.x + v.w, b, v.z),
            iso(v.x + v.w, t, v.z),
            iso(v.x + v.w, t, v.z + v.d),
            iso(v.x + v.w, b, v.z + v.d),
          ];
          const left: P[] = [
            iso(v.x, b, v.z + v.d),
            iso(v.x + v.w, b, v.z + v.d),
            iso(v.x + v.w, t, v.z + v.d),
            iso(v.x, t, v.z + v.d),
          ];
          // mullions / floor lines
          const lines: [P, P][] = [];
          if (v.glass) {
            const step = Math.max(1.5, Math.min(3, v.w / 10));
            for (let x = v.x + step; x < v.x + v.w - 0.1; x += step)
              lines.push([iso(x, b, v.z + v.d), iso(x, t, v.z + v.d)]);
            for (let z = v.z + step; z < v.z + v.d - 0.1; z += step)
              lines.push([iso(v.x + v.w, b, z), iso(v.x + v.w, t, z)]);
          } else if (v.h > 5) {
            for (let y = b + 3.4; y < t - 0.5; y += 3.4) {
              lines.push([iso(v.x, y, v.z + v.d), iso(v.x + v.w, y, v.z + v.d)]);
              lines.push([iso(v.x + v.w, y, v.z), iso(v.x + v.w, y, v.z + v.d)]);
            }
          }
          return (
            <g key={i}>
              <polygon
                points={pts(right)}
                fill={clay ? (v.glass ? "#dfe3e4" : "#ececea") : "none"}
                vectorEffect="non-scaling-stroke"
              />
              <polygon
                points={pts(left)}
                fill={clay ? (v.glass ? "#cfd4d6" : "#dcdcd8") : "none"}
                vectorEffect="non-scaling-stroke"
              />
              <polygon
                points={pts(top)}
                fill={clay ? "#ffffff" : "none"}
                vectorEffect="non-scaling-stroke"
              />
              <g strokeOpacity={0.32}>
                {lines.map(([a, c], j) => (
                  <line
                    key={j}
                    x1={a[0]}
                    y1={a[1]}
                    x2={c[0]}
                    y2={c[1]}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
  if (!callouts.length && !caption) return svg;
  return (
    <figure className="axo-figure">
      <div className="axo-wrap">
        {svg}
        {callouts.map((c, i) => (
          <span
            key={i}
            className="axo-note"
            data-side={c.right ? "right" : "left"}
            style={pct(c.l, c.right)}
          >
            {c.text}
          </span>
        ))}
      </div>
      {caption && <figcaption className="axo-caption">{caption}</figcaption>}
    </figure>
  );
}
