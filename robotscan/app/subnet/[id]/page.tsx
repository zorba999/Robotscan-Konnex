import { notFound } from "next/navigation";
import { Activity, Bot, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { StatCard } from "@/components/stat-card";
import { SubnetPill } from "@/components/subnet-pill";
import { RobotsLeaderboard } from "@/components/robots-leaderboard";
import { ValidatorsTable } from "@/components/validators-table";
import { MissionRow } from "@/components/mission-row";
import { SUBNETS } from "@/lib/subnets";
import {
  getMissionsBySubnet,
  getRobotsBySubnet,
  getValidatorsBySubnet,
} from "@/lib/mock-data";
import { formatNumber, formatPercent } from "@/lib/format";
import type { SubnetId } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

const VALID_SUBNETS = Object.keys(SUBNETS) as SubnetId[];

export default async function SubnetPage({ params }: Props) {
  const { id } = await params;
  if (!VALID_SUBNETS.includes(id as SubnetId)) notFound();

  const subnetId = id as SubnetId;
  const subnet = SUBNETS[subnetId];
  const robots = getRobotsBySubnet(subnetId, "trustScore");
  const missions = getMissionsBySubnet(subnetId, 30);
  const validators = getValidatorsBySubnet(subnetId).sort(
    (a, b) => b.stakeKnx - a.stakeKnx,
  );

  const totalRobotMissions = robots.reduce((a, r) => a + r.totalMissions, 0);
  const totalSuccess = robots.reduce((a, r) => a + r.successfulMissions, 0);
  const avgScore =
    robots.length > 0
      ? robots.reduce((a, r) => a + r.avgScore, 0) / robots.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <SubnetPill subnet={subnetId} link={false} />
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              subnet.status === "live"
                ? "text-emerald-600"
                : "text-amber-600"
            }`}
          >
            {subnet.status === "live" ? "Live pilot" : "In development"}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {subnet.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {subnet.description}
          </p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Robots"
          value={formatNumber(robots.length)}
          hint={`${formatNumber(
            robots.filter((r) => r.status === "active").length,
          )} active`}
          icon={<Bot className="h-4 w-4" />}
        />
        <StatCard
          label="Missions"
          value={formatNumber(totalRobotMissions)}
          hint={`${formatNumber(missions.length)} recent`}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="Success rate"
          value={formatPercent(
            totalRobotMissions > 0 ? totalSuccess / totalRobotMissions : 0,
          )}
          hint="aggregate across subnet"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Validators"
          value={formatNumber(validators.length)}
          hint={`avg agreement ${formatPercent(
            validators.length > 0
              ? validators.reduce((a, v) => a + v.agreementRate, 0) /
                  validators.length
              : 0,
            2,
          )}`}
          icon={<Shield className="h-4 w-4" />}
        />
      </section>

      <Tabs defaultValue="robots">
        <TabsList>
          <TabsTrigger value="robots">
            Robots
            <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
              {robots.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="missions">
            Recent missions
            <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
              {missions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="validators">
            Validators
            <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
              {validators.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="robots" className="mt-4">
          <Card className="py-0">
            <CardContent className="p-0 overflow-x-auto">
              <div className="border-b px-4 py-3">
                <h2 className="text-sm font-semibold">
                  Robots ranked by trust score
                </h2>
                <p className="text-xs text-muted-foreground">
                  Avg score across subnet: {avgScore.toFixed(3)}
                </p>
              </div>
              <RobotsLeaderboard robots={robots} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions" className="mt-4">
          <Card className="py-0">
            <CardContent className="p-0">
              <div className="border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Recent missions</h2>
                <p className="text-xs text-muted-foreground">
                  Live feed for {subnet.shortName}
                </p>
              </div>
              <div>
                {missions.map((m) => (
                  <MissionRow key={m.id} m={m} />
                ))}
                {missions.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No recent missions in this subnet.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validators" className="mt-4">
          <Card className="py-0">
            <CardContent className="p-0 overflow-x-auto">
              <div className="border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Active validators</h2>
                <p className="text-xs text-muted-foreground">
                  Ranked by KNX stake
                </p>
              </div>
              <ValidatorsTable validators={validators} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
