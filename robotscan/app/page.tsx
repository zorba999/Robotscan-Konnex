import Link from "next/link";
import { Activity, Bot, Coins, Shield, ArrowRight } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { MissionRow } from "@/components/mission-row";
import { SubnetPill } from "@/components/subnet-pill";
import { SUBNET_LIST } from "@/lib/subnets";
import {
  getLiveStats,
  getMissions,
  getMissionsBySubnet,
  getRobotsBySubnet,
} from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";

export default function HomePage() {
  const stats = getLiveStats();
  const recentMissions = getMissions().slice(0, 8);

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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Konnex Testnet · {formatNumber(stats.totalMissions)} missions indexed
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            The Etherscan for{" "}
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
              autonomous machines
            </span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Search any robot, mission, or validator. See full
            Proof-of-Physical-Work history, trajectories, sensor data, and
            on-chain reputation.
          </p>
          <div className="mt-6 mx-auto max-w-2xl">
            <SearchBar
              size="lg"
              placeholder="Search by robot name, mission ID, validator…"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Network at a glance
          </h2>
          <span className="text-xs text-muted-foreground">
            Updated 18:00 UTC
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Robots"
            value={formatNumber(stats.activeRobots)}
            hint={`of ${formatNumber(stats.totalRobots)} registered`}
            icon={<Bot className="h-4 w-4" />}
          />
          <StatCard
            label="Missions / 24h"
            value={formatNumber(stats.missionsLast24h)}
            hint={`${formatNumber(stats.totalMissions)} all-time`}
            icon={<Activity className="h-4 w-4" />}
          />
          <StatCard
            label="Validators Online"
            value={formatNumber(stats.activeValidators)}
            hint={`of ${formatNumber(stats.totalValidators)} total`}
            icon={<Shield className="h-4 w-4" />}
          />
          <StatCard
            label="Avg Reward 24h"
            value={`${stats.avgRewardKnx24h.toFixed(2)}`}
            hint={`KNX · ${formatNumber(stats.totalKnxSettled)} total settled`}
            icon={<Coins className="h-4 w-4" />}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 py-0">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Latest missions</h2>
                <p className="text-xs text-muted-foreground">
                  Real-time PoPW activity across all subnets
                </p>
              </div>
              <Link
                href="/missions"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div>
              {recentMissions.map((m) => (
                <MissionRow key={m.id} m={m} />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="py-0">
            <CardContent className="p-0">
              <div className="border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Subnets</h2>
                <p className="text-xs text-muted-foreground">
                  Workload classes on Konnex
                </p>
              </div>
              <div>
                {SUBNET_LIST.map((sn) => {
                  const robotCount = getRobotsBySubnet(sn.id).length;
                  const missionCount = getMissionsBySubnet(sn.id).length;
                  return (
                    <Link
                      key={sn.id}
                      href={`/subnet/${sn.id}`}
                      className="block px-4 py-3 hover:bg-accent/60 transition-colors border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <SubnetPill subnet={sn.id} link={false} />
                        <span
                          className={`text-xs font-medium ${
                            sn.status === "live"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {sn.status === "live" ? "Live pilot" : "In development"}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-medium">{sn.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {sn.description}
                      </div>
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground tabular-nums">
                        <span>
                          <span className="font-semibold text-foreground">
                            {robotCount}
                          </span>{" "}
                          robots
                        </span>
                        <span>
                          <span className="font-semibold text-foreground">
                            {formatNumber(missionCount)}
                          </span>{" "}
                          missions
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
