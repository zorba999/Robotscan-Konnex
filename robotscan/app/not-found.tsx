import Link from "next/link";
import { SearchBar } from "@/components/search-bar";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center space-y-6">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
        Not found
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        We couldn&apos;t find that on the chain.
      </h1>
      <p className="text-muted-foreground">
        The robot, mission, or validator you searched for isn&apos;t indexed yet.
        Double-check the hash, or browse a subnet to see live activity.
      </p>
      <div className="max-w-xl mx-auto">
        <SearchBar size="lg" />
      </div>
      <div className="flex justify-center gap-3 text-sm">
        <Link
          href="/"
          className="rounded-md border px-3 py-1.5 hover:bg-accent transition-colors"
        >
          Home
        </Link>
        <Link
          href="/subnet/drone-nav"
          className="rounded-md border px-3 py-1.5 hover:bg-accent transition-colors"
        >
          Drone Navigation
        </Link>
        <Link
          href="/subnet/slam"
          className="rounded-md border px-3 py-1.5 hover:bg-accent transition-colors"
        >
          SLAM
        </Link>
      </div>
    </div>
  );
}
