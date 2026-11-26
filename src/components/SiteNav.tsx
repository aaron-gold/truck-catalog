import { Link } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Catalog" },
  { to: "/policy", label: "Policy" },
  { to: "/glossary", label: "Glossary" },
  { to: "/progress", label: "Progress" },
  { to: "/clients", label: "Clients" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <span className="font-semibold text-foreground">Truck Damage Dictionary</span>
        <nav className="flex gap-1 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: true }}
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-muted text-foreground" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
