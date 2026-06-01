"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Mission } from "@/lib/types";

type Bucket = { day: string; missions: number; avgScore: number };

function bucketMissions(missions: Mission[]): Bucket[] {
  const buckets = new Map<string, { missions: number; sum: number }>();
  for (const m of missions) {
    const day = m.createdAt.toISOString().slice(0, 10);
    const existing = buckets.get(day) ?? { missions: 0, sum: 0 };
    existing.missions += 1;
    existing.sum += m.avgScore || 0;
    buckets.set(day, existing);
  }
  return Array.from(buckets.entries())
    .map(([day, b]) => ({
      day,
      missions: b.missions,
      avgScore: b.missions > 0 ? Number((b.sum / b.missions).toFixed(3)) : 0,
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function MissionTimelineChart({
  missions,
}: {
  missions: Mission[];
}) {
  const data = bucketMissions(missions);

  if (data.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-sm text-muted-foreground">
        No mission history yet.
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="missionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              backgroundColor: "var(--popover)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--muted-foreground)", fontSize: 11 }}
          />
          <Area
            type="monotone"
            dataKey="missions"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#missionGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
