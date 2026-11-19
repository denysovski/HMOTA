import { geoMercator, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, Polygon } from "geojson";
import czGeo from "@/data/cz-geo.json";

export type LonLat = [number, number];

export interface CzGeo {
  source: string;
  border: LonLat[];
  regions: { name: string; ring: LonLat[] }[];
  rivers: { name: string; line: LonLat[] }[];
  cities: { name: string; lon: number; lat: number; pop: number }[];
}

export const geo = czGeo as unknown as CzGeo;

export const borderFeature: Feature<Polygon> = {
  type: "Feature",
  properties: {},
  geometry: { type: "Polygon", coordinates: [geo.border] },
};

/** A Mercator projection fitted so Czechia fills the given box. */
export function fitProjection(x0: number, y0: number, x1: number, y1: number): GeoProjection {
  return geoMercator().fitExtent(
    [
      [x0, y0],
      [x1, y1],
    ],
    borderFeature,
  );
}

/** Width and height (world units) of the 3D map. */
export const WORLD = { width: 20, height: 12.4 };

const worldProjection = fitProjection(
  -WORLD.width / 2,
  -WORLD.height / 2,
  WORLD.width / 2,
  WORLD.height / 2,
);

/** Project WGS84 lon/lat to 3D map ground coordinates (x to the east, z to the south). */
export function project(lon: number, lat: number): { x: number; z: number } {
  const p = worldProjection([lon, lat]);
  if (!p) throw new Error(`Cannot project ${lon}, ${lat}`);
  return { x: p[0], z: p[1] };
}

/** SVG helpers for the flat maps (teaser, locator, no-WebGL fallback). */
export function svgMap(width: number, height: number, pad = 8) {
  const projection = fitProjection(pad, pad, width - pad, height - pad);
  const path = geoPath(projection);
  const ringPath = (ring: LonLat[]) =>
    path({ type: "Polygon", coordinates: [ring] } as Polygon) ?? "";
  const linePath = (line: LonLat[]) => path({ type: "LineString", coordinates: line }) ?? "";
  const point = (lon: number, lat: number) => projection([lon, lat]) ?? [0, 0];
  return { projection, ringPath, linePath, point };
}
