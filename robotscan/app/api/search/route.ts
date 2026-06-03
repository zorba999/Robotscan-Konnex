import { NextResponse } from "next/server";
import { getNeurons, getSubnets } from "@/lib/konnex/queries";

export const revalidate = 30;

type Hit = {
  kind: "subnet" | "neuron";
  label: string;
  sublabel: string;
  href: string;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q || q.length < 2) {
    return NextResponse.json({ hits: [] });
  }

  const subnetsResult = await getSubnets();
  const subnets = subnetsResult.value;
  const hits: Hit[] = [];

  // Subnet matches by name, description, netuid, github
  for (const s of subnets) {
    const matchesNetuid = /^\d+$/.test(q) && s.netuid === Number(q);
    if (
      matchesNetuid ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.githubRepo.toLowerCase().includes(q)
    ) {
      hits.push({
        kind: "subnet",
        label: s.name,
        sublabel: `netuid ${s.netuid} · ${s.neurons} neurons`,
        href: `/subnet/${s.netuid}`,
      });
    }
    if (hits.length >= 12) break;
  }

  // Hotkey / UID search across populated subnets (cap work)
  if (hits.length < 24) {
    const isLikelyHotkey = q.length >= 6 && /^[0-9a-z]+$/i.test(q);
    if (isLikelyHotkey) {
      const populated = subnets
        .filter((s) => s.neurons > 0)
        .sort((a, b) => b.neurons - a.neurons)
        .slice(0, 6);

      for (const s of populated) {
        const ns = await getNeurons(s.netuid);
        for (const n of ns.value) {
          if (n.hotkey.toLowerCase().includes(q)) {
            hits.push({
              kind: "neuron",
              label: `UID ${n.uid} · ${s.name}`,
              sublabel: n.hotkey,
              href: `/robot/${n.hotkey}`,
            });
            if (hits.length >= 24) break;
          }
        }
        if (hits.length >= 24) break;
      }
    }
  }

  return NextResponse.json({ hits: hits.slice(0, 24) });
}
