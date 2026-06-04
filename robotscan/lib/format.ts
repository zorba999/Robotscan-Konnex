export function shortHex(s: string, head = 6, tail = 4): string {
  if (!s) return "";
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(n: number, decimals = 1): string {
  return `${(n * 100).toFixed(decimals)}%`;
}

export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec.toFixed(0)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

const NOW = new Date("2026-06-01T18:00:00Z").getTime();

export function timeAgo(date: Date): string {
  const seconds = Math.max(1, Math.floor((NOW - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ") + " UTC";
}

export const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60",
  idle: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-700",
  offline: "text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-700",
  slashed: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60",
  settled: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60",
  executing: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
  validating: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
  pending: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-700",
  failed: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60",
};
