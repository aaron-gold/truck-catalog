import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { clients } from "@/lib/clients";
import { linesForClient } from "@/lib/catalog-data";

const TITLE = "Clients · Truck Damage Dictionary";
const DESC = "Private policy links for each client.";
export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [
    { title: TITLE }, { name: "description", content: DESC }, { name: "robots", content: "noindex" },
    { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Clients,
});

function Clients() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="mt-1 text-sm text-muted-foreground">Team only. Send each client their own link — they only see their policy.</p>
        <div className="mt-6 space-y-3">
          {clients.map((c) => {
            const n = linesForClient(c).length;
            return (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-muted-foreground">{c.vehicles.join(" + ")} · {c.parts.length ? `${c.parts.length} chosen parts` : "all parts"} · {n} damage types</div>
                </div>
                <div className="flex gap-2">
                  <Link to="/c/$clientId" params={{ clientId: c.id }} className="rounded-md border border-input px-3 py-1.5 text-sm">Open</Link>
                  <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/c/${c.id}`)}
                    className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">Copy link</button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
