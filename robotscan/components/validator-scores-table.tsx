import { CopyHash } from "@/components/copy-hash";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ValidatorScore } from "@/lib/types";
import { timeAgo } from "@/lib/format";

function ScoreCell({ v }: { v: number }) {
  const pct = Math.max(0, Math.min(1, v));
  const color =
    pct > 0.92 ? "#10b981" : pct > 0.82 ? "#3b82f6" : pct > 0.7 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <span className="tabular-nums font-medium">{v.toFixed(3)}</span>
      <div className="relative h-1.5 w-14 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ValidatorScoresTable({
  scores,
}: {
  scores: ValidatorScore[];
}) {
  if (scores.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        No validator scores submitted yet.
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Validator</TableHead>
          <TableHead>Safety</TableHead>
          <TableHead>Accuracy</TableHead>
          <TableHead>Efficiency</TableHead>
          <TableHead className="text-right">Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scores.map((s) => (
          <TableRow key={s.validatorId}>
            <TableCell>
              <CopyHash value={s.validatorId} />
            </TableCell>
            <TableCell>
              <ScoreCell v={s.safety} />
            </TableCell>
            <TableCell>
              <ScoreCell v={s.accuracy} />
            </TableCell>
            <TableCell>
              <ScoreCell v={s.efficiency} />
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">
              {timeAgo(s.submittedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
