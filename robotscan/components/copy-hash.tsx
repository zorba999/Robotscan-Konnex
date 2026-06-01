"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { shortHex } from "@/lib/format";

export function CopyHash({
  value,
  head = 6,
  tail = 4,
  className,
}: {
  value: string;
  head?: number;
  tail?: number;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1300);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors",
        className,
      )}
      title={value}
    >
      <span>{shortHex(value, head, tail)}</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3 opacity-60" />
      )}
    </button>
  );
}
