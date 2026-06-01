import Link from "next/link";
import { Bot } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Robot } from "@/lib/types";
import { StatusBadge, TrustTierBadge } from "@/components/status-badge";
import { CopyHash } from "@/components/copy-hash";
import { formatNumber, formatPercent, timeAgo } from "@/lib/format";

export function RobotsLeaderboard({ robots }: { robots: Robot[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Robot</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Trust</TableHead>
          <TableHead className="text-right">Missions</TableHead>
          <TableHead className="text-right">Success</TableHead>
          <TableHead className="text-right">Earned (KNX)</TableHead>
          <TableHead className="text-right">Last seen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {robots.map((r, i) => (
          <TableRow key={r.id}>
            <TableCell className="text-muted-foreground tabular-nums">
              {i + 1}
            </TableCell>
            <TableCell>
              <Link
                href={`/robot/${r.id}`}
                className="flex items-center gap-2 group"
              >
                <div className="grid h-7 w-7 place-items-center rounded-md bg-muted">
                  <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium group-hover:underline">
                    {r.name}
                  </div>
                  <CopyHash value={r.id} head={6} tail={4} />
                </div>
              </Link>
            </TableCell>
            <TableCell>
              <StatusBadge status={r.status} />
            </TableCell>
            <TableCell>
              <TrustTierBadge tier={r.trustTier} score={r.trustScore} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumber(r.totalMissions)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPercent(r.successfulMissions / r.totalMissions)}
            </TableCell>
            <TableCell className="text-right tabular-nums font-medium">
              {r.totalEarnedKnx.toFixed(1)}
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">
              {timeAgo(r.lastSeenAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
