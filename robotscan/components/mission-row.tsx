import Link from "next/link";
import type { Mission } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { SubnetPill } from "@/components/subnet-pill";
import { formatDuration, shortHex, timeAgo } from "@/lib/format";
import { getRobotById } from "@/lib/mock-data";
import { Bot } from "lucide-react";

export function MissionRow({ m }: { m: Mission }) {
  const robot = getRobotById(m.robotId);
  return (
    <Link
      href={`/mission/${m.id}`}
      className="flex items-start gap-3 px-4 py-3 hover:bg-accent/60 transition-colors border-b last:border-b-0"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate max-w-[60%]">
            {m.instruction}
          </span>
          <StatusBadge status={m.status} />
          <SubnetPill subnet={m.subnet} link={false} />
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {robot ? (
            <span className="font-mono">{robot.name}</span>
          ) : null}
          <span className="font-mono">{shortHex(m.id, 8, 6)}</span>
          <span>· {timeAgo(m.createdAt)}</span>
          <span>· {formatDuration(m.durationSec)}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold tabular-nums">
          {m.rewardAmount.toFixed(3)}{" "}
          <span className="text-xs text-muted-foreground">{m.rewardToken}</span>
        </div>
        {m.scores.length > 0 ? (
          <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            score {m.avgScore.toFixed(2)}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
