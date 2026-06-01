import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  FileCode2,
  MapPin,
  Sigma,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { SubnetPill } from "@/components/subnet-pill";
import { CopyHash } from "@/components/copy-hash";
import { TrajectoryPlot } from "@/components/trajectory-plot";
import { SensorCharts } from "@/components/sensor-charts";
import { ValidatorScoresTable } from "@/components/validator-scores-table";
import { getMissionById, getRobotById } from "@/lib/mock-data";
import { getSubnet } from "@/lib/subnets";
import { formatDate, formatDuration, timeAgo } from "@/lib/format";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MissionDetailPage({ params }: Props) {
  const { id } = await params;
  const mission = getMissionById(id);
  if (!mission) notFound();
  const robot = getRobotById(mission.robotId);
  const subnet = getSubnet(mission.subnet);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SubnetPill subnet={mission.subnet} />
          <StatusBadge status={mission.status} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {mission.instruction}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <CopyHash value={mission.id} head={10} tail={8} />
            <span>· Created {timeAgo(mission.createdAt)}</span>
            {mission.completedAt ? (
              <span>· Completed {timeAgo(mission.completedAt)}</span>
            ) : null}
          </div>
        </div>
        {robot ? (
          <Link
            href={`/robot/${robot.id}`}
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <span className="text-xs text-muted-foreground">Executed by</span>
            <span className="font-medium">{robot.name}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        ) : null}
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Reward"
          value={`${mission.rewardAmount.toFixed(3)} ${mission.rewardToken}`}
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard
          label="Duration"
          value={formatDuration(mission.durationSec)}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Avg Score"
          value={mission.avgScore.toFixed(3)}
          hint={`across ${mission.scores.length} validators`}
          icon={<Sigma className="h-4 w-4" />}
        />
        <StatCard
          label="Waypoints"
          value={mission.trajectory.length || "—"}
          hint={
            mission.trajectory.length > 0
              ? "GPS samples logged"
              : "no GPS for this subnet"
          }
          icon={<MapPin className="h-4 w-4" />}
        />
      </section>

      {mission.trajectory.length > 0 ? (
        <Card className="py-0">
          <CardContent className="p-0">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Trajectory</h2>
                <p className="text-xs text-muted-foreground">
                  GPS waypoints replayed from PoPW bundle ·{" "}
                  <span className="font-mono">{subnet.shortName}</span>
                </p>
              </div>
            </div>
            <div className="p-4">
              <TrajectoryPlot
                points={mission.trajectory}
                color={subnet.color}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="py-0">
        <CardContent className="p-0">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Sensor traces</h2>
            <p className="text-xs text-muted-foreground">
              Sampled telemetry signed at the edge by TEE — re-verified by
              validators on replay
            </p>
          </div>
          <div className="p-4">
            <SensorCharts series={mission.sensorSeries} />
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="p-0">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Validator scores</h2>
            <p className="text-xs text-muted-foreground">
              Independent assessment of safety, task accuracy, and efficiency
            </p>
          </div>
          <ValidatorScoresTable scores={mission.scores} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Onchain references
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Instruction hash</dt>
              <dd className="mt-1 flex items-center gap-2">
                <CopyHash value={mission.instructionHash} head={12} tail={10} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">PoPW bundle (IPFS)</dt>
              <dd className="mt-1 flex items-center gap-2">
                <span className="font-mono text-xs break-all">
                  {mission.popwBundleCid.slice(0, 16)}…{mission.popwBundleCid.slice(-8)}
                </span>
                <a
                  href={`https://ipfs.io/ipfs/${mission.popwBundleCid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Raw <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Created at</dt>
              <dd className="mt-1 font-mono text-xs">
                {formatDate(mission.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Settlement token</dt>
              <dd className="mt-1 font-medium">
                {mission.rewardToken}
                <span className="ml-2 text-xs text-muted-foreground">
                  via PayoutRouter
                </span>
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <FileCode2 className="h-3.5 w-3.5" />
            Bundle decoded client-side. No data was ever modified.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
