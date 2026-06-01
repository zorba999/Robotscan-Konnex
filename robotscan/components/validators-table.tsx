import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Validator } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { CopyHash } from "@/components/copy-hash";
import { formatNumber, formatPercent } from "@/lib/format";

export function ValidatorsTable({
  validators,
}: {
  validators: Validator[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Validator</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Stake (KNX)</TableHead>
          <TableHead className="text-right">Stake (USDC)</TableHead>
          <TableHead className="text-right">Missions</TableHead>
          <TableHead className="text-right">Agreement</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {validators.map((v) => (
          <TableRow key={v.id}>
            <TableCell>
              <Link
                href={`/validator/${v.id}`}
                className="text-sm font-medium hover:underline"
              >
                {v.name}
              </Link>
              <div>
                <CopyHash value={v.id} />
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={v.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumber(v.stakeKnx)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumber(v.stakeUsdc)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumber(v.missionsValidated)}
            </TableCell>
            <TableCell className="text-right tabular-nums font-medium">
              {formatPercent(v.agreementRate, 2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
