"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SensorSample } from "@/lib/types";

const SERIES: {
  key: keyof Pick<
    SensorSample,
    "speed" | "accelMag" | "gyroMag" | "temp" | "battery"
  >;
  label: string;
  unit: string;
  color: string;
}[] = [
  { key: "speed", label: "Speed", unit: "m/s", color: "#3b82f6" },
  { key: "accelMag", label: "Accel |a|", unit: "m/s²", color: "#8b5cf6" },
  { key: "gyroMag", label: "Gyro |ω|", unit: "rad/s", color: "#ec4899" },
  { key: "temp", label: "Core temp", unit: "°C", color: "#f59e0b" },
  { key: "battery", label: "Battery", unit: "%", color: "#10b981" },
];

export function SensorCharts({ series }: { series: SensorSample[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SERIES.map((s) => (
        <div
          key={s.key}
          className="rounded-lg border bg-card p-3"
        >
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {s.unit}
            </div>
          </div>
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 2, right: 2, bottom: 0, left: -28 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="t" hide />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--popover)",
                    fontSize: 11,
                    padding: "4px 8px",
                  }}
                  labelFormatter={(t) => `t=${Number(t).toFixed(1)}s`}
                  formatter={(v: number) => [v.toFixed(2), s.label]}
                />
                <Line
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={1.6}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
