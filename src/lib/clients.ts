/**
 * Client policies. Each client gets a private link: /c/<id>.
 * Use a long random id so links can't be guessed.
 * - vehicles: which vehicle types they see ("Truck", "Trailer")
 * - parts: optional list of part names; leave empty to include every part
 * - excludeParts: parts to hide even when `parts` is empty
 */
export type ClientPolicy = {
  id: string;
  name: string;
  vehicles: string[];
  parts: string[];
  excludeParts: string[];
};

export const clients: ClientPolicy[] = [
  { id: "demo-fleet-7k3p9x", name: "Demo Fleet Co.", vehicles: ["Truck", "Trailer"], parts: [], excludeParts: [] },
  { id: "northline-trailers-q8m2v4", name: "Northline Trailers", vehicles: ["Trailer"], parts: [], excludeParts: [] },
];

export const findClient = (id: string) => clients.find((c) => c.id === id);
