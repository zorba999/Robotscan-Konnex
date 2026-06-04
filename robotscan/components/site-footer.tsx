import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="text-base font-bold tracking-tight">Robotscan</div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            The public ledger of verified physical work on Konnex. Search every
            subnet, neuron, validator, and PoPW escrow — with the world map of
            where the machines actually run.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Community-built explorer. Not affiliated with Konnex Inc.
          </p>
        </div>
        <div className="text-sm">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Konnex
          </div>
          <ul className="space-y-2">
            <li>
              <a
                href="https://docs.konnex.world"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Docs
              </a>
            </li>
            <li>
              <a
                href="https://subnets.testnet.konnex.world/faucet"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Faucet
              </a>
            </li>
            <li>
              <a
                href="https://subnets.testnet.konnex.world/explorer"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Blockchain Explorer
              </a>
            </li>
            <li>
              <a
                href="https://subnets.testnet.konnex.world/builders"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Builder Program
              </a>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Explore
          </div>
          <ul className="space-y-2">
            <li>
              <Link href="/subnets" className="hover:underline">
                All subnets
              </Link>
            </li>
            <li>
              <Link href="/subnet/4" className="hover:underline">
                drone-navigation
              </Link>
            </li>
            <li>
              <Link href="/subnet/7" className="hover:underline">
                Sensor Fusion Edge
              </Link>
            </li>
            <li>
              <Link href="/subnet/5" className="hover:underline">
                KonnexSLAM
              </Link>
            </li>
            <li>
              <Link href="/escrows" className="hover:underline">
                PoPW Escrows
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>© 2026 Robotscan. Open-source builder cohort applicant.</span>
          <span className="font-mono">Network: Konnex Testnet · Mock data</span>
        </div>
      </div>
    </footer>
  );
}
