#!/usr/bin/env node
// Bakes the Czech geodata used by the maps into one small JSON file.
//
// Source: Natural Earth 1:10m (public domain), read from the natural-earth-vector repository.
// Output: src/data/cz-geo.json with the border, the 14 regions (kraje), main rivers and cities,
// in WGS84 lon/lat, simplified with Douglas-Peucker. Run: npm run bake:geo
//
// Pass a local folder with the .geojson files as the first argument to bake offline.

import { writeFile, readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const localDir = process.argv[2];

async function load(name) {
  if (localDir) return JSON.parse(await readFile(join(localDir, `${name}.geojson`), "utf8"));
  const res = await fetch(`${BASE}/${name}.geojson`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json();
}

const round = (n) => Math.round(n * 10000) / 10000;

function perpDist(p, a, b) {
  const [x, y] = p;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function simplify(points, tol) {
  if (points.length < 3) return points;
  let max = 0;
  let idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], points[0], points[points.length - 1]);
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= tol) return [points[0], points[points.length - 1]];
  const left = simplify(points.slice(0, idx + 1), tol);
  const right = simplify(points.slice(idx), tol);
  return [...left.slice(0, -1), ...right];
}

const ring = (pts, tol) => simplify(pts, tol).map(([x, y]) => [round(x), round(y)]);

function outerRings(geom) {
  if (geom.type === "Polygon") return [geom.coordinates[0]];
  return geom.coordinates.map((poly) => poly[0]);
}

function largest(rings) {
  return rings.reduce((a, b) => (b.length > a.length ? b : a));
}

const BBOX = { minX: 12.0, maxX: 18.95, minY: 48.5, maxY: 51.1 };
const inBox = ([x, y]) => x > BBOX.minX && x < BBOX.maxX && y > BBOX.minY && y < BBOX.maxY;

const REGION_NAMES = {
  Prague: "Praha",
  Ústecký: "Ústecký",
  Liberecký: "Liberecký",
  Karlovarský: "Karlovarský",
  Plzeňský: "Plzeňský",
  Jihočeský: "Jihočeský",
  Královéhradecký: "Královéhradecký",
  Olomoucký: "Olomoucký",
  Pardubický: "Pardubický",
  Moravskoslezský: "Moravskoslezský",
  Jihomoravský: "Jihomoravský",
  Zlínský: "Zlínský",
  Vysočina: "Vysočina",
  Středočeský: "Středočeský",
};

const CITY_NAMES = {
  Prague: "Praha",
  Pizen: "Plzeň",
  "Usti Nad Labem": "Ústí nad Labem",
};

const RIVERS = {
  Vltava: "Vltava",
  Elbe: "Labe",
  Morava: "Morava",
  Oder: "Odra",
  Dyje: "Dyje",
  Sázava: "Sázava",
  Svratka: "Svratka",
  Eger: "Ohře",
  "Luzicka Nisa": "Lužická Nisa",
};

const [countries, admin1, riversA, riversB, places] = await Promise.all([
  load("ne_10m_admin_0_countries"),
  load("ne_10m_admin_1_states_provinces"),
  load("ne_10m_rivers_lake_centerlines"),
  load("ne_10m_rivers_europe"),
  load("ne_10m_populated_places_simple"),
]);

const cz = countries.features.find((f) => f.properties.ADM0_A3 === "CZE");
const border = ring(largest(outerRings(cz.geometry)), 0.004);

const regions = admin1.features
  .filter((f) => f.properties.adm0_a3 === "CZE")
  .map((f) => ({
    name: REGION_NAMES[f.properties.name] ?? f.properties.name,
    ring: ring(largest(outerRings(f.geometry)), 0.006),
  }));

const rivers = [];
for (const f of [...riversA.features, ...riversB.features]) {
  const name = RIVERS[f.properties.name];
  if (!name || !f.geometry) continue;
  const lines =
    f.geometry.type === "LineString" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const line of lines) {
    // keep only the stretches inside the Czech bounding box
    let run = [];
    for (const p of line) {
      if (inBox(p)) run.push(p);
      else if (run.length) {
        if (run.length > 2) rivers.push({ name, line: ring(run, 0.004) });
        run = [];
      }
    }
    if (run.length > 2) rivers.push({ name, line: ring(run, 0.004) });
  }
}

const cities = places.features
  .filter((f) => f.properties.adm0_a3 === "CZE")
  .map((f) => ({
    name: CITY_NAMES[f.properties.name] ?? f.properties.name,
    lon: round(f.geometry.coordinates[0]),
    lat: round(f.geometry.coordinates[1]),
    pop: f.properties.pop_max,
  }))
  .sort((a, b) => b.pop - a.pop);

const out = {
  source: "Natural Earth 1:10m (public domain), naturalearthdata.com",
  border,
  regions,
  rivers,
  cities,
};

await mkdir("src/data", { recursive: true });
await writeFile("src/data/cz-geo.json", JSON.stringify(out));
console.log(
  `border ${border.length} pts, ${regions.length} regions, ${rivers.length} river lines, ${cities.length} cities`,
);
