import Link from "next/link";
import { CheckCircle2, Lock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CopyHash } from "@/components/copy-hash";
import { DataSourceBanner } from "@/components/data-source-banner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getChainStats, getEscrows } from "@/lib/konnex/queries";
import { formatNumber } from "@/lib/format";

export const revalidate = 30;

export const metadata = {
  title: "PoPW Escrows",
};

export default async function EscrowsPage() {
  const [escrowsResult, statsResult] = await Promise.all([
    getEscrows(),
    getChainStats(),
  ]);
  const escrows = escrowsResult.value;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="space-y-3">
        <DataSourceBanner
          live={escrowsResult.live}
          block={statsResult.value.block}
          endpoint={escrowsResult.endpoint}
        />
        <h1 className="text-3xl font-bold tracking-tight">PoPW Escrows</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Tasks funded via the <code className="font-mono">KonnexEscrow</code>{" "}
          pallet. A payer locks tKNX, resolvers vote on completion, and funds
          release on majority approval (or refund after deadline).
        </p>
      </header>

      {escrows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                No escrows funded yet
              </h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                The <code className="font-mono">KonnexEscrow</code> pallet is
                live and ready. When subnet owners begin posting tasks, they
                will surface here in real time.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/subnets"
                className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
              >
                Browse subnets
              </Link>
              <a
                href="https://docs.konnex.world"
                target="_blank"
                rel="noreferrer"
                className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
              >
                How PoPW works
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Subnet</TableHead>
                  <TableHead>Payer → Payee</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                  <TableHead className="text-right">Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escrows.map((e) => (
                  <TableRow key={`${e.subnetId}-${e.taskId}`}>
                    <TableCell>
                      <div className="font-mono text-xs">
                        {e.taskId.slice(0, 16)}…
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/subnet/${e.subnetId}`}
                        className="text-xs hover:underline font-mono"
                      >
                        netuid {e.subnetId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <CopyHash value={e.payer} head={8} tail={6} />
                        <CopyHash value={e.payee} head={8} tail={6} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {e.amount.toFixed(4)} tKNX
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-0.5 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          {e.approvals}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-red-600">
                          <XCircle className="h-3 w-3" />
                          {e.rejections}
                        </span>
                        <span className="text-muted-foreground">
                          / {e.resolverCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                      #{formatNumber(e.deadline)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
