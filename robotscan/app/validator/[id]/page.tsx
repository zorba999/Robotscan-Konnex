import { notFound } from "next/navigation";
import { Activity, Coins, Handshake, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { SubnetPill } from "@/components/subnet-pill";
import { CopyHash } from "@/components/copy-hash";
import { getValidatorById, getMissions } from "@/lib/mock-data";
import {
  formatDate,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { MissionRow } from "@/components/mission-row";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ValidatorDetailPage({ params }: Props) {
  const { id } = await params;
  const validator = getValidatorById(id);
  if (!validator) notFound();

  const scoredMissions = getMissions()
    .filter((m) => m.scores.some((s) => s.validatorId === validator.id))
    .slice(0, 15);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SubnetPill subnet={validator.subnet} />
          <StatusBadge status={validator.status} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {validator.name}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <CopyHash value={validator.id} head={10} tail={8} />
            <span>· Joined {formatDate(validator.joinedAt)}</span>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="KNX Stake"
          value={formatNumber(validator.stakeKnx)}
          hint="protocol security"
          icon={<Coins className="h-4 w-4" />}
        />
        <StatCard
          label="USDC Stake"
          value={formatNumber(validator.stakeUsdc)}
          hint="settlement assurance"
          icon={<Shield className="h-4 w-4" />}
        />
        <StatCard
          label="Missions Validated"
          value={formatNumber(validator.missionsValidated)}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="Agreement Rate"
          value={formatPercent(validator.agreementRate, 2)}
          hint="vs. consensus"
          icon={<Handshake className="h-4 w-4" />}
        />
      </section>

      <Card className="py-0">
        <CardContent className="p-0">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Recent scored missions</h2>
            <p className="text-xs text-muted-foreground">
              Missions this validator has signed off on
            </p>
          </div>
          <div>
            {scoredMissions.map((m) => (
              <MissionRow key={m.id} m={m} />
            ))}
            {scoredMissions.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No scored missions found in the recent window.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
