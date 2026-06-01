import type { TrustTier } from "@/lib/types";
import { TRUST_TIER_COLORS } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TrustMeter({
  score,
  tier,
}: {
  score: number;
  tier: TrustTier;
}) {
  const pct = Math.max(0, Math.min(100, (score / 1000) * 100));
  const stops = [
    { x: 25, label: "Bronze" },
    { x: 50, label: "Silver" },
    { x: 75, label: "Gold" },
    { x: 90, label: "Diamond" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Trust Score
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums">{score}</span>
            <span className="text-sm text-muted-foreground">/ 1000</span>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
            TRUST_TIER_COLORS[tier],
          )}
        >
          {tier} tier
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 via-50% to-sky-500"
          style={{ width: `${pct}%` }}
        />
        {stops.map((s) => (
          <div
            key={s.x}
            className="absolute top-0 h-full w-px bg-background/70"
            style={{ left: `${s.x}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Bronze</span>
        <span>Silver</span>
        <span>Gold</span>
        <span>Diamond</span>
      </div>
    </div>
  );
}
