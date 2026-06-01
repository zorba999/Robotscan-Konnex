import Link from "next/link";
import { getSubnet } from "@/lib/subnets";
import type { SubnetId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SubnetPill({
  subnet,
  className,
  link = true,
}: {
  subnet: SubnetId;
  className?: string;
  link?: boolean;
}) {
  const meta = getSubnet(subnet);
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
        link ? "hover:bg-accent" : "",
        className,
      )}
      style={{
        borderColor: meta.color + "40",
        color: meta.color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.shortName}
    </span>
  );
  return link ? (
    <Link href={`/subnet/${meta.id}`}>{content}</Link>
  ) : (
    content
  );
}
