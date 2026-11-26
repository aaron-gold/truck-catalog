import { createFileRoute, notFound } from "@tanstack/react-router";
import { findClient } from "@/lib/clients";
import { linesForClient } from "@/lib/catalog-data";
import { PolicyView } from "./policy";

export const Route = createFileRoute("/c/$clientId")({
  loader: ({ params }) => {
    const client = findClient(params.clientId);
    if (!client) throw notFound();
    return { name: client.name, id: client.id };
  },
  head: ({ loaderData }) => {
    const t = `${loaderData?.name ?? "Client"} · Damage policy`;
    const d = "Your covered truck and trailer damages with severity guidelines.";
    return { meta: [
      { title: t }, { name: "description", content: d }, { name: "robots", content: "noindex" },
      { property: "og:title", content: t }, { property: "og:description", content: d },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: ClientPolicyPage,
});

function ClientPolicyPage() {
  const { id, name } = Route.useLoaderData();
  const client = findClient(id)!;
  return <PolicyView source={linesForClient(client)} clientName={name} showNav={false} />;
}
