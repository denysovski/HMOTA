import { STATUSES, TYPES, type Project } from "@/content/schema";

const MONTHS = [
  "leden",
  "únor",
  "březen",
  "duben",
  "květen",
  "červen",
  "červenec",
  "srpen",
  "září",
  "říjen",
  "listopad",
  "prosinec",
];

export const area = (m2: number) => `${new Intl.NumberFormat("cs-CZ").format(m2)} m²`;

export function monthYear(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${y}`;
}

export function monthsBetween(from: string, to: string) {
  const [y1, m1] = from.split("-").map(Number) as [number, number];
  const [y2, m2] = to.split("-").map(Number) as [number, number];
  return (y2 - y1) * 12 + (m2 - m1);
}

function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

export function duration(p: Pick<Project, "commissioned" | "completed">) {
  if (!p.completed) return "probíhá";
  const n = monthsBetween(p.commissioned, p.completed);
  return `${n} ${plural(n, "měsíc", "měsíce", "měsíců")}`;
}

export const typeLabel = (p: Pick<Project, "type">) => TYPES[p.type];
export const statusLabel = (p: Pick<Project, "status">) => STATUSES[p.status];
export const year = (p: Pick<Project, "commissioned" | "completed">) =>
  (p.completed ?? p.commissioned).slice(0, 4);

export function regionLabel(region: string) {
  if (region === "Praha") return "Hlavní město Praha";
  if (region === "Vysočina") return "Kraj Vysočina";
  return `${region} kraj`;
}
