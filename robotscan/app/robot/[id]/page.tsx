import { notFound } from "next/navigation";
import {
  Activity,
  Award,
  CheckCircle2,
  Coins,
  Cpu,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge, TrustTierBadge } from "@/components/status-badge";
import { SubnetPill } from "@/components/subnet-pill";
import { CopyHash } from "@/components/copy-hash";
import { TrustMeter } from "@/components/trust-meter";
import { MissionTimelineChart } from "@/components/mission-timeline-chart";
import { MissionRow } from "@/components/mission-row";
import {
  getMissionsByRobotId,
  getRobotById,
} from "@/lib/mock-data";
import {
  formatDate,
  formatNumber,
  formatPercent,
  timeAgo,
} from "@/lib/format";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RobotDetailPage({ params }: Props) {
  const { id } = await params;
  const robot = getRobotById(id);
  if (!robot) notFound();

  const missions = getMissionsByRobotId(robot.id);
  const successRate =
    robot.totalMissions > 0
      ? robot.successfulMissions / robot.totalMissions
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <SubnetPill subnet={robot.subnet} />
          <StatusBadge status={robot.status} />
          {robot.teeAttested ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> TEE-attested
            </span>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {robot.name}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <CopyHash value={robot.id} head={10} tail={8} />
              <span>· Last seen {timeAgo(robot.lastSeenAt)}</span>
            </div>
          </div>
          <TrustTierBadge tier={robot.trustTier} score={robot.trustScore} />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <TrustMeter score={robot.trustScore} tier={robot.trustTier} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
              Identity
            </h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center gap-2">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                <dt className="text-muted-foreground w-20">Owner</dt>
                <dd className="flex-1">
                  <CopyHash value={robot.owner} />
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                <dt className="text-muted-foreground w-20">Hardware</dt>
                <dd className="flex-1 font-mono text-xs">
                  {robot.hardwareId}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-3.5 w-3.5 text-muted-foreground" />
                <dt className="text-muted-foreground w-20">Registered</dt>
                <dd className="flex-1 text-xs">{formatDate(robot.registeredAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Missions"
          value={formatNumber(robot.totalMissions)}
          hint={`${formatNumber(robot.successfulMissions)} successful`}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="Success Rate"
          value={formatPercent(successRate)}
          hint="rolling all-time"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          label="Avg Score"
          value={robot.avgScore.toFixed(3)}
          hint="validator-scored"
          icon={<Award className="h-4 w-4" />}
        />
        <StatCard
          label="Total Earned"
          value={`${robot.totalEarnedKnx.toFixed(1)} KNX`}
          hint={`+ ${robot.totalEarnedUsdc.toFixed(0)} USDC`}
          icon={<Coins className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 py-0">
          <CardContent className="p-0">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Mission timeline</h2>
              <p className="text-xs text-muted-foreground">
                Daily missions over the last sample window
              </p>
            </div>
            <div className="p-4">
              <MissionTimelineChart missions={missions} />
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-0">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Quick stats</h2>
            </div>
            <dl className="divide-y text-sm">
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-muted-foreground">Indexed missions</dt>
                <dd className="font-medium tabular-nums">{missions.length}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-muted-foreground">Validators interacted</dt>
                <dd className="font-medium tabular-nums">
                  {new Set(
                    missions.flatMap((m) => m.scores.map((s) => s.validatorId)),
                  ).size}
                </dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-muted-foreground">Avg duration</dt>
                <dd className="font-medium tabular-nums">
                  {missions.length > 0
                    ? Math.round(
                        missions.reduce((a, m) => a + m.durationSec, 0) /
                          missions.length,
                      )
                    : 0}
                  s
                </dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-muted-foreground">Subnet rank</dt>
                <dd className="font-medium">By trust score</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="py-0">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Recent missions</h2>
                <p className="text-xs text-muted-foreground">
                  Last {Math.min(missions.length, 25)} PoPW events for this robot
                </p>
              </div>
            </div>
            <div>
              {missions.slice(0, 25).map((m) => (
                <MissionRow key={m.id} m={m} />
              ))}
              {missions.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No missions recorded yet.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
