"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Network, Search, ServerCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { shortHex } from "@/lib/format";

type Hit = {
  kind: "subnet" | "neuron";
  label: string;
  sublabel: string;
  href: string;
};

const KIND_META: Record<Hit["kind"], { label: string; icon: React.ElementType }> = {
  subnet: { label: "Subnet", icon: Network },
  neuron: { label: "Neuron", icon: ServerCog },
};

export function SearchBar({
  size = "md",
  placeholder = "Search subnet name, hotkey, netuid…",
}: {
  size?: "md" | "lg";
  placeholder?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debouncerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = React.useRef(0);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  React.useEffect(() => {
    if (debouncerRef.current) clearTimeout(debouncerRef.current);
    if (!query || query.trim().length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debouncerRef.current = setTimeout(async () => {
      const reqId = ++reqIdRef.current;
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
        );
        const data = (await res.json()) as { hits: Hit[] };
        if (reqId === reqIdRef.current) {
          setHits(data.hits ?? []);
          setActive(0);
        }
      } catch {
        if (reqId === reqIdRef.current) setHits([]);
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    }, 220);
    return () => {
      if (debouncerRef.current) clearTimeout(debouncerRef.current);
    };
  }, [query]);

  const inputClass =
    size === "lg"
      ? "h-14 pl-12 pr-4 text-base rounded-xl"
      : "h-10 pl-10 pr-3 rounded-lg";
  const iconClass = size === "lg" ? "h-5 w-5 left-4" : "h-4 w-4 left-3";

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      router.push(hits[active].href);
      setOpen(false);
      setQuery("");
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${iconClass}`}
        />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClass}
        />
      </div>
      {open && hits.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-[60vh] overflow-y-auto rounded-xl border bg-popover shadow-lg">
          {hits.map((r, i) => {
            const meta = KIND_META[r.kind];
            const Icon = meta.icon;
            return (
              <Link
                key={r.kind + r.href + i}
                href={r.href}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex items-start gap-3 px-3 py-2.5 border-b last:border-b-0 ${
                  i === active ? "bg-accent" : ""
                }`}
              >
                <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {meta.label}
                    </span>
                  </div>
                  <div className="text-sm font-medium truncate">{r.label}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {r.kind === "neuron" ? shortHex(r.sublabel, 10, 6) : r.sublabel}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {open && query && hits.length === 0 && !loading && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border bg-popover px-4 py-6 text-center text-sm text-muted-foreground shadow-lg">
          No live matches for &quot;{query}&quot;.
        </div>
      )}
      {open && loading && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border bg-popover px-4 py-3 text-xs text-muted-foreground shadow-lg">
          Searching chain…
        </div>
      )}
    </div>
  );
}
