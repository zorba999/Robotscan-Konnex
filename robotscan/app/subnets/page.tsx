import { SubnetCard } from "@/components/subnet-card";
import { DataSourceBanner } from "@/components/data-source-banner";
import { getChainStats, getSubnets } from "@/lib/konnex/queries";
import { formatNumber } from "@/lib/format";

export const revalidate = 30;

export const metadata = {
  title: "All subnets",
};

export default async function SubnetsPage() {
  const [subnetsResult, statsResult] = await Promise.all([
    getSubnets(),
    getChainStats(),
  ]);
  const subnets = subnetsResult.value;
  const populated = subnets.filter((s) => s.neurons > 0);
  const empty = subnets.filter((s) => s.neurons === 0);
  const totalNeurons = subnets.reduce((a, s) => a + s.neurons, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="space-y-3">
        <DataSourceBanner
          live={subnetsResult.live}
          block={statsResult.value.block}
          endpoint={subnetsResult.endpoint}
        />
        <h1 className="text-3xl font-bold tracking-tight">Subnets</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Every workload class registered on Konnex testnet. {formatNumber(populated.length)} populated
          with {formatNumber(totalNeurons)} neurons,
          {" "}{formatNumber(empty.length)} reserved/empty.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Populated ({populated.length})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {populated.map((s) => (
            <SubnetCard key={s.netuid} subnet={s} />
          ))}
        </div>
      </section>

      {empty.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Empty / reserved ({empty.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {empty.map((s) => (
              <SubnetCard key={s.netuid} subnet={s} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
