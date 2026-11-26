import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { damageLines, orphanPhotos, photoList } from "@/lib/catalog-data";

const TITLE = "Progress · Truck Damage Dictionary";
const DESC = "Internal photo coverage, missing examples and naming problems.";
export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [
    { title: TITLE }, { name: "description", content: DESC }, { name: "robots", content: "noindex" },
    { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Progress,
});

function Progress() {
  const covered = damageLines.filter((l) => l.photoCount > 0).length;
  const pct = Math.round((covered / damageLines.length) * 100);
  const missing = damageLines.filter((l) => l.photoCount === 0);
  const recent = [...photoList].filter((p) => p.addedAt).sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? "")).slice(0, 12);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">Team only — don't share this page with clients.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[["Damage lines", damageLines.length], ["With photos", covered], ["Missing photos", missing.length], ["Photos total", photoList.length]].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border p-4"><div className="text-sm text-muted-foreground">{k}</div><div className="text-2xl font-semibold">{v}</div></div>
          ))}
        </div>
        <div className="mt-4"><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
          <div className="mt-1 text-sm text-muted-foreground">{pct}% of damage lines have at least one photo</div></div>

        {orphanPhotos.length > 0 && (
          <section className="mt-8">
            <h2 className="font-semibold">Photos that match no damage line ({orphanPhotos.length})</h2>
            <p className="text-sm text-muted-foreground">Usually a spelling difference between the file name and the sheet.</p>
            <ul className="mt-2 space-y-1 text-sm">{orphanPhotos.map((p) => <li key={p.path} className="font-mono">{p.path}</li>)}</ul>
          </section>
        )}

        <section className="mt-8">
          <h2 className="font-semibold">Still need photos ({missing.length})</h2>
          <div className="mt-2 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm"><thead className="bg-muted text-left"><tr>
              {["Vehicle", "Part", "Damage", "Severity"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
            </tr></thead><tbody>
              {missing.map((l, i) => <tr key={i} className="border-t border-border"><td className="px-3 py-2">{l.vehicle}</td><td className="px-3 py-2">{l.part}</td><td className="px-3 py-2">{l.damage}</td><td className="px-3 py-2">{l.severity}</td></tr>)}
            </tbody></table>
          </div>
        </section>

        {recent.length > 0 && (
          <section className="mt-8">
            <h2 className="font-semibold">Recently added</h2>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {recent.map((p) => <img key={p.path} src={p.img} alt={`${p.carPart} – ${p.condition}`} loading="lazy" className="aspect-square w-full rounded object-cover" />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
