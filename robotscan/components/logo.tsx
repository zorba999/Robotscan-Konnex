import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim =
    size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const text =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div
        className={`${dim} relative grid place-items-center rounded-lg bg-foreground text-background font-bold transition-transform group-hover:scale-[1.04]`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-1/2 w-1/2"
        >
          <path
            d="M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect
            x="3"
            y="11"
            width="18"
            height="9"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="9" cy="15.5" r="1.2" fill="currentColor" />
          <circle cx="15" cy="15.5" r="1.2" fill="currentColor" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${text} font-bold tracking-tight`}>Robotscan</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">
          Konnex Explorer
        </span>
      </div>
    </Link>
  );
}
