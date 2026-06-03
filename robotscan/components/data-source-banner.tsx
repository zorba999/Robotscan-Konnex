import { Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataSourceBanner({
  live,
  block,
  endpoint,
  className,
}: {
  live: boolean;
  block?: number;
  endpoint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
        live
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400",
        className,
      )}
      title={endpoint}
    >
      {live ? (
        <>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <Activity className="h-3 w-3" />
          <span>Live</span>
          {typeof block === "number" && block > 0 ? (
            <span className="font-mono opacity-80">· block #{block.toLocaleString("en-US")}</span>
          ) : null}
        </>
      ) : (
        <>
          <AlertTriangle className="h-3 w-3" />
          <span>RPC unavailable · fallback</span>
        </>
      )}
    </div>
  );
}
