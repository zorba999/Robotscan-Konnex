import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  Coins,
  Cpu,
  Globe,
  Network,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { CopyHash } from "@/components/copy-hash";
import { DataSourceBanner } from "@/components/data-source-banner";
import {
  getChainStats,
  getNeuronByHotkey,
} from "@/lib/konnex/queries";
import { formatNumber } from "@/lib/format";

export const revalidate = 30;

type Props = { params: Promise<{ id: string }> };

export default async function NeuronDetailPage({ params }: Props) {
  const { id } = await params;
  if (!id || id.length < 8) notFound();

  const [result, statsResult] = await Promise.all([
    getNeuronByHotkey(id),
    getChainStats(),
  ]);

  if (!result.value) notFound();
  const { neuron, subnet } = result.value;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <DataSourceBanner
            live={result.live}
            block={statsResult.value.block}
            endpoint={result.endpoint}
          />
          <Link
            href={`/subnet/${subnet.netuid}`}
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono hover:bg-accent"
          >
            netuid {subnet.netuid} · {subnet.name}
          </Link>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
              neuron.active
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {neuron.active ? "active" : "idle"}
          </span>
          {neuron.validatorPermit ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400">
              <ShieldCheck className="h-3 w-3" />
              Validator permit
            </span>
          ) : null}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            UID {neuron.uid} ·{" "}
            <span className="text-muted-foreground">{subnet.name}</span>
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span>hotkey</span>
            <CopyHash value={neuron.hotkey} head={12} tail={8} />
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="α Stake"
          value={`${neuron.alphaStake.toFixed(4)}`}
          hint="tKNX held by this neuron"
          icon={<Coins className="h-4 w-4" />}
        />
        <StatCard
          label="Role"
          value={neuron.validatorPermit ? "Validator" : "Miner"}
          hint={
            neuron.validatorPermit
              ? "Scores other neurons' work"
              : "Executes physical work"
          }
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          label="Endpoint"
          value={
            neuron.ip && neuron.port > 0 ? (
              <span className="font-mono text-base">
                {neuron.ip}:{neuron.port}
              </span>
            ) : (
              <span className="text-base text-muted-foreground">—</span>
            )
          }
          hint={
            neuron.ip
              ? `IPv${neuron.ipVersion} · proto ${neuron.protocol}`
              : "no axon advertised"
          }
          icon={<Globe className="h-4 w-4" />}
        />
        <StatCard
          label="Subnet"
          value={
            <Link
              href={`/subnet/${subnet.netuid}`}
              className="text-base hover:underline"
            >
              netuid {subnet.netuid}
            </Link>
          }
          hint={`${formatNumber(subnet.neurons)} total neurons`}
          icon={<Network className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Identity
            </h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2">
                <Cpu className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                <dt className="text-muted-foreground w-24">Hotkey</dt>
                <dd className="flex-1 min-w-0">
                  <CopyHash value={neuron.hotkey} head={12} tail={10} />
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <Wallet className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                <dt className="text-muted-foreground w-24">Coldkey</dt>
                <dd className="flex-1 min-w-0">
                  {neuron.coldkey ? (
                    <CopyHash value={neuron.coldkey} head={12} tail={10} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                <dt className="text-muted-foreground w-24">Axon block</dt>
                <dd className="flex-1 font-mono text-xs">
                  {neuron.axonBlock > 0 ? `#${formatNumber(neuron.axonBlock)}` : "—"}
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <Cpu className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                <dt className="text-muted-foreground w-24">Axon version</dt>
                <dd className="flex-1 font-mono text-xs">
                  {neuron.axonVersion || "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Subnet context
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Name</div>
                <div className="font-medium">{subnet.name}</div>
              </div>
              {subnet.description ? (
                <div>
                  <div className="text-xs text-muted-foreground">Description</div>
                  <div className="text-sm leading-relaxed">
                    {subnet.description}
                  </div>
                </div>
              ) : null}
              {subnet.githubRepo ? (
                <div>
                  <div className="text-xs text-muted-foreground">Repository</div>
                  <a
                    href={subnet.githubRepo}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs hover:underline break-all"
                  >
                    {subnet.githubRepo}
                  </a>
                </div>
              ) : null}
              <div>
                <Link
                  href={`/subnet/${subnet.netuid}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  View all neurons in netuid {subnet.netuid} →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            PoPW activity
          </h2>
          <p className="text-sm text-muted-foreground">
            No KonnexEscrow tasks have been funded for this neuron yet. When
            subnet owners post a task and resolvers vote, the bundle (instruction
            hash, sensor traces, validator scores) will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
