/**
 * Stylised relief of Czechia (0 = lowland, 1 = highest ridge).
 *
 * This is NOT measured elevation. It models the main ranges as soft ridges so the map reads like a
 * site model. Replace with a baked Copernicus DEM GLO-30 heightmap when available (see README).
 */
type Ridge = { from: [number, number]; to: [number, number]; h: number; w: number };

const RIDGES: Ridge[] = [
  { from: [15.35, 50.76], to: [15.95, 50.7], h: 1.0, w: 0.09 }, // Krkonoše
  { from: [15.05, 50.86], to: [15.38, 50.8], h: 0.62, w: 0.07 }, // Jizerské hory
  { from: [16.2, 50.37], to: [16.6, 50.13], h: 0.6, w: 0.07 }, // Orlické hory
  { from: [16.85, 50.3], to: [17.4, 49.98], h: 0.86, w: 0.1 }, // Hrubý Jeseník
  { from: [18.05, 49.6], to: [18.85, 49.45], h: 0.76, w: 0.1 }, // Beskydy
  { from: [17.55, 49.15], to: [18.25, 48.98], h: 0.42, w: 0.08 }, // Bílé Karpaty
  { from: [12.6, 49.38], to: [14.05, 48.74], h: 0.84, w: 0.13 }, // Šumava
  { from: [12.45, 49.95], to: [12.75, 49.4], h: 0.46, w: 0.08 }, // Český les
  { from: [12.2, 50.27], to: [13.95, 50.73], h: 0.72, w: 0.09 }, // Krušné hory
  { from: [13.05, 50.3], to: [13.2, 50.22], h: 0.4, w: 0.08 }, // Doupovské hory
  { from: [13.75, 49.82], to: [14.0, 49.65], h: 0.36, w: 0.09 }, // Brdy
  { from: [15.1, 49.45], to: [16.25, 49.62], h: 0.42, w: 0.26 }, // Českomoravská vrchovina
  { from: [14.6, 48.68], to: [14.95, 48.6], h: 0.42, w: 0.08 }, // Novohradské hory
  { from: [14.1, 50.78], to: [14.7, 50.86], h: 0.38, w: 0.07 }, // Lužické hory
];

function segDist(px: number, py: number, [ax, ay]: [number, number], [bx, by]: [number, number]) {
  // work in a rough local metric: a degree of longitude is ~0.65 of a degree of latitude here
  const k = 0.65;
  const dx = (bx - ax) * k;
  const dy = by - ay;
  const qx = (px - ax) * k;
  const qy = py - ay;
  const t = Math.max(0, Math.min(1, (qx * dx + qy * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(qx - t * dx, qy - t * dy);
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function reliefAt(lon: number, lat: number): number {
  let h = 0.16 + 0.06 * noise(lon * 3, lat * 3) + 0.04 * noise(lon * 9, lat * 9);
  // lowlands: Polabí (Elbe), Dolnomoravský úval, Haná
  h -= 0.1 * Math.exp(-((lon - 15.2) ** 2 / 0.6 + (lat - 50.15) ** 2 / 0.03));
  h -= 0.1 * Math.exp(-((lon - 17.0) ** 2 / 0.15 + (lat - 48.85) ** 2 / 0.05));
  h -= 0.08 * Math.exp(-((lon - 17.2) ** 2 / 0.05 + (lat - 49.5) ** 2 / 0.04));
  for (const r of RIDGES) {
    const d = segDist(lon, lat, r.from, r.to);
    h += r.h * Math.exp(-(d * d) / (2 * r.w * r.w)) * (0.85 + 0.3 * noise(lon * 14, lat * 14));
  }
  return Math.max(0, Math.min(1.15, h));
}
