import sheet from "../../public/legacy/sheets-data.json";
import photos from "../../public/legacy/catalog.json";

export type DamageLine = {
  category: string;
  area: string;
  orientation: string;
  vehicle: string;
  part: string;
  damage: string;
  severity: string;
  impact: string;
  criteria: string;
  status: string;
  photoCount: number;
  photoUrl?: string;
};

type Photo = { img: string; carPart: string; condition: string; isHealthy?: boolean; truckTrailer?: string; addedAt?: string; path: string };

export const norm = (s: string) => (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
const clean = (s: string) => (s ?? "").replace(/\s+/g, " ").trim();

const allPhotos = photos as Photo[];
const rows = sheet as string[][];
const header = rows[0] ?? [];
const col = (name: string) => header.findIndex((h) => norm(h) === norm(name));
const C = {
  category: col("Category"), area: col("Area"), orientation: col("Orientation"), vehicle: col("Truck / Trailer"),
  part: col("Car Part"), damage: col("Damage Detection"), severity: col("SEV"), impact: col("Impact [MVT]"),
  criteria: col("Criteria"), status: col("Status"),
};
const get = (r: string[], i: number) => clean(i >= 0 ? (r[i] ?? "") : "");

export function photosFor(part: string, damage: string) {
  return allPhotos.filter((p) => !p.isHealthy && norm(p.carPart) === norm(part) && norm(p.condition) === norm(damage));
}

export const damageLines: DamageLine[] = rows.slice(1).filter((r) => get(r, C.part)).map((r) => {
  const part = get(r, C.part);
  const damage = get(r, C.damage);
  const ph = photosFor(part, damage);
  return {
    category: get(r, C.category), area: get(r, C.area), orientation: get(r, C.orientation), vehicle: get(r, C.vehicle),
    part, damage, severity: get(r, C.severity), impact: get(r, C.impact), criteria: get(r, C.criteria), status: get(r, C.status),
    photoCount: ph.length, ...(ph[0] ? { photoUrl: ph[0].img } : {}),
  };
});

export const photoList = allPhotos;

/** Photos whose part + condition match no damage line (likely a naming typo). */
export const orphanPhotos = allPhotos.filter(
  (p) => !p.isHealthy && !damageLines.some((l) => norm(l.part) === norm(p.carPart) && norm(l.damage) === norm(p.condition)),
);

export const SEVERITY_GUIDE: Record<string, string> = {
  "SEV - 1": "Critical — fix before the vehicle goes back on the road.",
  "SEV - 2": "Moderate — schedule a repair soon.",
  "SEV - 3": "Minor — note it and monitor.",
};

export const IMPACT_GUIDE: Record<string, string> = {
  "D.O.T & Safty": "Safety / DOT compliance",
  "High cost repair": "Expensive if left unrepaired",
  "PM / Early repair": "Catch early during preventive maintenance",
  "Drivre score": "Affects driver score",
  MPG: "Affects fuel economy",
};
export const impactLabel = (s: string) => IMPACT_GUIDE[s] ?? s;

export function toCsv(lines: DamageLine[]) {
  const head = ["Vehicle", "Category", "Area", "Part", "Damage", "Severity", "Severity guideline", "Impact", "Example photos", "Photo link"];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const body = lines.map((l) => [l.vehicle, l.category, l.area, l.part, l.damage, l.severity, SEVERITY_GUIDE[l.severity] ?? "", impactLabel(l.impact), l.photoCount, l.photoUrl ?? ""].map(esc).join(","));
  return "\uFEFF" + [head.map(esc).join(","), ...body].join("\r\n");
}

import type { ClientPolicy } from "./clients";
export function linesForClient(c: ClientPolicy) {
  const inc = new Set(c.parts.map(norm)), exc = new Set(c.excludeParts.map(norm));
  return damageLines.filter((l) => c.vehicles.includes(l.vehicle) && (inc.size === 0 || inc.has(norm(l.part))) && !exc.has(norm(l.part)));
}
