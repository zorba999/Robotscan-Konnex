import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  Code2,
  ExternalLink,
  MapPin,
  ServerCog,
  Shield,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { StatCard } from "@/components/stat-card";
import { CopyHash } from "@/components/copy-hash";
import { DataSourceBanner } from "@/components/data-source-banner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getChainStats,
  getNeurons,
  getSubnet,
  getSubnets,
} from "@/lib/konnex/queries";
import { formatNumber } from "@/lib/format";

export const revalidate = 30;

type Props = { params: Promise<{ id: string }> };

export default async function SubnetPage({ params }: Props) {
  const { id } = await params;
  const netuid = Number.parseInt(id, 10);
  if (!Number.isFinite(netuid) || netuid < 0) notFound();

  const [subnetResult, neuronsResult, statsResult] = await Promise.all([
    getSubnet(netuid),
    getNeurons(netuid),
    getChainStats(),
  ]);

  const subnet = subnetResult.value;
  if (!subnet) notFound();

  const neurons = neuronsResult.value;
  const validators = neurons.filter((n) => n.validatorPermit);
  const miners = neurons.filter((n) => !n.validatorPermit);
  const active = neurons.filter((n) => n.active);
  const reachable = neurons.filter((n) => n.ip && n.port > 0);
  const totalStake = neurons.reduce((a, n) => a + n.alphaStake, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <DataSourceBanner
            live={subnetResult.live && neuronsResult.live}
            block={statsResult.value.block}
            endpoint={subnetResult.endpoint}
          />
          <span className="font-mono text-muted-foreground">
            netuid {subnet.netuid}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {subnet.name}
          </h1>
          {subnet.description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {subnet.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {subnet.owner ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="h-3 w-3" />
              owner <CopyHash value={subnet.owner} />
            </span>
          ) : null}
          {subnet.githubRepo ? (
            <a
              href={subnet.githubRepo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Code2 className="h-3 w-3" />
              {subnet.githubRepo.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
          {subnet.url ? (
            <a
              href={subnet.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              {subnet.url.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Registered neurons"
          value={formatNumber(neurons.length)}
          hint={`${active.length} active · ${reachable.length} reachable`}
          icon={<ServerCog className="h-4 w-4" />}
        />
        <StatCard
          label="Validators"
          value={formatNumber(validators.length)}
          hint={`${miners.length} miners`}
          icon={<Shield className="h-4 w-4" />}
        />
        <StatCard
          label="Total α stake"
          value={`${totalStake.toFixed(2)}`}
          hint="tKNX held by subnet neurons"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="Reachable axons"
          value={formatNumber(reachable.length)}
          hint="advertised IP:port"
          icon={<MapPin className="h-4 w-4" />}
        />
      </section>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All
            <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
              {neurons.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="validators">
            Validators
            <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
              {validators.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="miners">
            Miners
            <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
              {miners.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <NeuronsTable rows={neurons} />
        </TabsContent>
        <TabsContent value="validators" className="mt-4">
          <NeuronsTable rows={validators} />
        </TabsContent>
        <TabsContent value="miners" className="mt-4">
          <NeuronsTable rows={miners} />
        </TabsContent>
      </Tabs>

      <FurtherReading />
    </div>
  );
}

function NeuronsTable({
  rows,
}: {
  rows: Awaited<ReturnType<typeof getNeurons>>["value"];
}) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No neurons in this view.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="py-0">
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">UID</TableHead>
              <TableHead>Hotkey</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Axon</TableHead>
              <TableHead className="text-right">α stake (tKNX)</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((n) => (
              <TableRow key={`${n.netuid}-${n.uid}`}>
                <TableCell className="tabular-nums text-muted-foreground">
                  {n.uid}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/robot/${n.hotkey}`}
                    className="text-sm hover:underline"
                  >
                    <CopyHash value={n.hotkey} head={8} tail={6} />
                  </Link>
                </TableCell>
                <TableCell>
                  {n.validatorPermit ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400">
                      Validator
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
                      Miner
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {n.ip && n.port > 0 ? (
                    <span>
                      {n.ip}:{n.port}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">not advertised</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {n.alphaStake.toFixed(4)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      n.active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300"
                    }`}
                  >
                    <span className="h-1 w-1 rounded-full bg-current opacity-70" />
                    {n.active ? "active" : "idle"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

async function FurtherReading() {
  const subnetsResult = await getSubnets();
  const others = subnetsResult.value.filter((s) => s.neurons > 0).slice(0, 6);
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Other populated subnets
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((s) => (
          <Link
            key={s.netuid}
            href={`/subnet/${s.netuid}`}
            className="rounded-lg border bg-card px-3 py-2.5 hover:bg-accent/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-muted-foreground">
                netuid {s.netuid}
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {s.neurons} neurons
              </span>
            </div>
            <div className="mt-1 text-sm font-medium truncate">{s.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
