import Link from "next/link";
import { Logo } from "@/components/logo";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/subnets", label: "Subnets" },
  { href: "/escrows", label: "Escrows" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:gap-6">
        <Logo size="md" />
        <div className="hidden flex-1 md:block max-w-xl mx-auto">
          <SearchBar />
        </div>
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
      <div className="border-t md:hidden">
        <div className="px-4 py-2">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
