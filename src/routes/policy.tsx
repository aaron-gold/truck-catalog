import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { damageLines, SEVERITY_GUIDE, impactLabel, toCsv, type DamageLine } from "@/lib/catalog-data";

const TITLE = "Damage Policy · Truck Damage Dictionary";
const DESC = "Every covered truck and trailer damage with severity and guidelines, ready to download.";
export const Route = createFileRoute("/policy")({
  head: () => ({ meta: [
    { title: TITLE }, { name: "description", content: DESC },
    { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <PolicyView source={damageLines} />,
});

export function PolicyView({ source, clientName, showNav = true }: { source: DamageLine[]; clientName?: string; showNav?: boolean }) {
  const [q, setQ] = useState("");
  const [vehicle, setVehicle] = useState("All");
  const lines = useMemo(() => source.filter((l) =>
    (vehicle === "All" || l.vehicle === vehicle) &&
    `${l.part} ${l.damage} ${l.category} ${l.area}`.toLowerCase().includes(q.toLowerCase())), [q, vehicle, source]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(lines)], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${clientName ? clientName.replace(/\W+/g, "-").toLowerCase() + "-" : ""}damage-policy.csv` });
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showNav && <SiteNav />}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold">{clientName ? `${clientName} · Damage policy` : "Damage policy"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{lines.length} damage types covered. Severity tells you how urgent each one is.</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {Object.entries(SEVERITY_GUIDE).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border p-3 text-sm"><b>{k}</b><div className="text-muted-foreground">{v}</div></div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 print:hidden">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search part or damage…"
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm" />
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option>All</option><option>Truck</option><option>Trailer</option>
          </select>
          <button onClick={download} className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground">Download Excel (CSV)</button>
          <button onClick={() => window.print()} className="h-9 rounded-md border border-input px-3 text-sm">Save as PDF</button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left"><tr>
              {["Vehicle", "Area", "Part", "Damage", "Severity", "Impact", "Photos"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2">{l.vehicle}</td><td className="px-3 py-2">{l.area}</td>
                  <td className="px-3 py-2 font-medium">{l.part}</td><td className="px-3 py-2">{l.damage}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{l.severity}</td><td className="px-3 py-2">{impactLabel(l.impact)}</td>
                  <td className="px-3 py-2">{l.photoUrl ? <a href={l.photoUrl} target="_blank" rel="noreferrer" className="text-primary underline">{l.photoCount}</a> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
