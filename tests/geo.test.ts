import { describe, expect, it } from "vitest";
import { project, WORLD } from "@/lib/geo";
import { reliefAt } from "@/lib/relief";
import { duration, monthsBetween } from "@/lib/format";
import { projects } from "@/content/projects";

describe("project()", () => {
  const praha = project(14.42, 50.087);
  const brno = project(16.608, 49.195);
  const ostrava = project(18.282, 49.835);

  it("keeps the cities in their real order", () => {
    expect(praha.x).toBeLessThan(brno.x);
    expect(brno.x).toBeLessThan(ostrava.x);
    expect(praha.z).toBeLessThan(brno.z); // north is up, so Praha has a smaller z than Brno
    expect(ostrava.z).toBeLessThan(brno.z);
  });

  it("places every project inside the map", () => {
    for (const p of projects) {
      const { x, z } = project(p.lng, p.lat);
      expect(Math.abs(x)).toBeLessThanOrEqual(WORLD.width / 2);
      expect(Math.abs(z)).toBeLessThanOrEqual(WORLD.height / 2);
    }
  });
});

describe("relief", () => {
  it("is higher in Krkonoše than in Polabí", () => {
    expect(reliefAt(15.74, 50.73)).toBeGreaterThan(reliefAt(15.2, 50.15) + 0.4);
  });
});

describe("format", () => {
  it("counts months and handles ongoing projects", () => {
    expect(monthsBetween("2019-03", "2022-09")).toBe(42);
    expect(duration({ commissioned: "2023-01", completed: null })).toBe("probíhá");
    expect(duration({ commissioned: "2020-01", completed: "2020-04" })).toBe("3 měsíce");
  });
});
