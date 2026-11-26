import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Truck Damage Dictionary · UVeye" },
      { name: "description", content: "Browse truck and trailer damage examples by part and condition." },
      { property: "og:title", content: "Truck Damage Dictionary · UVeye" },
      { property: "og:description", content: "Browse truck and trailer damage examples by part and condition." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
    <iframe
      src="/legacy/index.html?v=3"
      title="Truck Damage Dictionary"
      className="fixed inset-0 h-screen w-screen border-0"
    />
    <nav className="fixed bottom-4 left-4 z-10 flex gap-1 rounded-full border border-border bg-background/95 p-1 text-sm shadow-lg">
      {(["/policy", "/glossary", "/progress"] as const).map((to) => (
        <Link key={to} to={to} className="rounded-full px-3 py-1.5 capitalize text-foreground hover:bg-muted">{to.slice(1)}</Link>
      ))}
    </nav>
    </>
  );
}
