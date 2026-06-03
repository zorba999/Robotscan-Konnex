import Link from "next/link";
import { ExternalLink, Code2, Users } from "lucide-react";
import type { Subnet } from "@/lib/konnex/queries";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

export function SubnetCard({ subnet }: { subnet: Subnet }) {
  return (
    <Link href={`/subnet/${subnet.netuid}`} className="group block">
      <Card className="h-full py-0 transition-colors group-hover:border-foreground/30">
        <CardContent className="p-4 flex flex-col gap-3 h-full">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">
                  netuid {subnet.netuid}
                </span>
              </div>
              <div className="mt-1 text-sm font-semibold leading-snug group-hover:underline truncate">
                {subnet.name}
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:border-neutral-800">
              <Users className="h-3 w-3" />
              <span className="tabular-nums">{formatNumber(subnet.neurons)}</span>
            </span>
          </div>
          {subnet.description ? (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {subnet.description}
            </p>
          ) : (
            <p className="text-xs italic text-muted-foreground/60">
              No description set on-chain
            </p>
          )}
          <div className="mt-auto flex items-center gap-3 text-[10px] text-muted-foreground">
            {subnet.githubRepo ? (
              <span className="inline-flex items-center gap-1">
                <Code2 className="h-3 w-3" />
                <span className="truncate max-w-[120px]">
                  {subnet.githubRepo.replace(/^https?:\/\//, "")}
                </span>
              </span>
            ) : null}
            {subnet.url ? (
              <span className="inline-flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                <span className="truncate max-w-[80px]">
                  {subnet.url.replace(/^https?:\/\//, "")}
                </span>
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
