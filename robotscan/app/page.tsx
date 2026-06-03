import Link from "next/link";
import { Activity, Bot, Coins, Database, Lock, ServerCog } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { SubnetCard } from "@/components/subnet-card";
import { DataSourceBanner } from "@/components/data-source-banner";
import { getChainStats, getSubnets, getEscrows } from "@/lib/konnex/queries";
import { formatNumber } from "@/lib/format";

export const revalidate = 30;

export default async function HomePage() {
  const [stats, subnets, escrows] = await Promise.all([
    getChainStats(),
    getSubnets(),
    getEscrows(),
  ]);

  const subnetsList = subnets.value;
  const featured = subnetsList
    .filter((s) => s.neurons > 0)
    .sort((a, b) => b.neurons - a.neurons);
  const totalNeurons = subnetsList.reduce((a, s) => a + s.neurons, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 space-y-12">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-zinc-50 to-zinc-100/40 dark:from-zinc-950 dark:to-zinc-900/40 px-6 py-12 sm:px-10 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <DataSourceBanner
              live={stats.live}
              block={stats.value.block}
              endpoint={stats.endpoint}
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            The Etherscan for{" "}
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
              autonomous machines
            </span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Live view of the Konnex testnet. Search subnets, neurons, validators —
            and watch Proof-of-Physical-Work escrows settle on-chain.
          </p>
          <div className="mt-6 mx-auto max-w-2xl">
            <SearchBar
              size="lg"
              placeholder="Search subnet name, hotkey (5G…), netuid…"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Network at a glance
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {stats.value.chain} · {stats.value.peers} peers
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active subnets"
            value={formatNumber(stats.value.totalSubnets)}
            hint={`${subnetsList.filter((s) => s.neurons > 0).length} populated`}
            icon={<ServerCog className="h-4 w-4" />}
          />
          <StatCard
            label="Registered neurons"
            value={formatNumber(totalNeurons)}
            hint="across all subnets"
            icon={<Bot className="h-4 w-4" />}
          />
          <StatCard
            label="Total stake"
            value={`${formatNumber(Math.round(stats.value.totalStake))}`}
            hint={`tKNX · ${formatNumber(Math.round(stats.value.totalIssuance))} issued`}
            icon={<Coins className="h-4 w-4" />}
          />
          <StatCard
            label="PoPW escrows"
            value={formatNumber(escrows.value.length)}
            hint={
              escrows.value.length === 0
                ? "KonnexEscrow live · awaiting first task"
                : "tasks in flight"
            }
            icon={<Lock className="h-4 w-4" />}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Populated subnets</h2>
              <p className="text-xs text-muted-foreground">
                Workload classes with at least one registered neuron
              </p>
            </div>
            <Link
              href="/subnets"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              All {stats.value.totalSubnets} →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {featured.slice(0, 8).map((s) => (
              <SubnetCard key={s.netuid} subnet={s} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="py-0">
            <CardContent className="p-0">
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Chain head</h2>
                  <p className="text-xs text-muted-foreground">
                    Real-time read from Konnex testnet
                  </p>
                </div>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <dl className="divide-y text-sm">
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-muted-foreground">Chain</dt>
                  <dd className="font-medium">{stats.value.chain}</dd>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-muted-foreground">Node</dt>
                  <dd className="font-mono text-xs">{stats.value.nodeName}</dd>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-muted-foreground">Block</dt>
                  <dd className="font-mono text-xs tabular-nums">
                    #{formatNumber(stats.value.block)}
                  </dd>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-muted-foreground">Peers</dt>
                  <dd className="tabular-nums">{stats.value.peers}</dd>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-muted-foreground">Syncing</dt>
                  <dd>{stats.value.isSyncing ? "yes" : "no"}</dd>
                </div>
                <div className="px-4 py-2.5">
                  <dt className="text-muted-foreground mb-1 text-xs">
                    Finalized hash
                  </dt>
                  <dd className="font-mono text-[10px] break-all text-muted-foreground">
                    {stats.value.finalizedHash}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
                  <Database className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    Phase 2 — PoPW indexer
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    KonnexEscrow is live on-chain. Once subnet teams begin funding
                    escrows, mission detail pages will surface trajectory and
                    sensor evidence the moment validators sign off.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
