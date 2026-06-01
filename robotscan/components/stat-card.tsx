import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("py-4", className)}>
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          {icon ? (
            <div className="text-muted-foreground/70">{icon}</div>
          ) : null}
        </div>
        <div className="mt-2 text-2xl font-bold tabular-nums leading-none sm:text-3xl">
          {value}
        </div>
        {hint ? (
          <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
