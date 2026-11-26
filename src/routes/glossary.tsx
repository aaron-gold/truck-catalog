import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { damageLines, photoList, norm } from "@/lib/catalog-data";

const TITLE = "Glossary · Truck Damage Dictionary";
const DESC = "Shared names for every truck and trailer part and damage type.";
export const Route = createFileRoute("/glossary")({
  head: () => ({ meta: [
    { title: TITLE }, { name: "description", content: DESC },
    { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Glossary,
});

function Glossary() {
  const [q, setQ] = useState("");
  const parts = useMemo(() => {
    const m = new Map<string, { part: string; category: string; area: string; vehicles: Set<string>; damages: Set<string>; photo?: string | undefined }>();
    for (const l of damageLines) {
      const k = norm(l.part);
      const e = m.get(k) ?? { part: l.part, category: l.category, area: l.area, vehicles: new Set(), damages: new Set() };
      e.vehicles.add(l.vehicle); e.damages.add(l.damage);
      m.set(k, e);
    }
    for (const e of m.values()) e.photo = photoList.find((p) => norm(p.carPart) === norm(e.part))?.img;
    return [...m.values()].sort((a, b) => a.part.localeCompare(b.part));
  }, []);
  const damages = useMemo(() => [...new Set(damageLines.map((l) => l.damage))].sort(), []);
  const shown = parts.filter((p) => `${p.part} ${p.category} ${[...p.damages].join(" ")}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Glossary</h1>
        <p className="mt-1 text-sm text-muted-foreground">{parts.length} parts and {damages.length} damage types — the names everyone should use.</p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a term…"
          className="mt-4 h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm" />

        <h2 className="mt-8 font-semibold">Damage types</h2>
        <div className="mt-2 flex flex-wrap gap-2">{damages.map((d) => <span key={d} className="rounded-full border border-border px-3 py-1 text-sm">{d}</span>)}</div>

        <h2 className="mt-8 font-semibold">Parts</h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <div key={p.part} className="flex gap-3 rounded-lg border border-border p-3">
              {p.photo ? <img src={p.photo} alt={p.part} loading="lazy" className="h-16 w-16 shrink-0 rounded object-cover" />
                : <div className="h-16 w-16 shrink-0 rounded bg-muted" />}
              <div className="min-w-0 text-sm">
                <div className="font-medium">{p.part}</div>
                <div className="text-muted-foreground">{p.category} · {p.area} · {[...p.vehicles].join(" / ")}</div>
                <div className="mt-1 text-muted-foreground">Damages: {[...p.damages].join(", ")}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
