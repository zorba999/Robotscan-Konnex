import { cn } from "@/lib/utils";
import { STATUS_COLORS, TRUST_TIER_COLORS } from "@/lib/format";
import type { TrustTier } from "@/lib/types";

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        color,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function TrustTierBadge({
  tier,
  score,
}: {
  tier: TrustTier;
  score?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold",
        TRUST_TIER_COLORS[tier],
      )}
    >
      <span>{tier}</span>
      {typeof score === "number" ? (
        <span className="opacity-75 tabular-nums">{score}</span>
      ) : null}
    </span>
  );
}
