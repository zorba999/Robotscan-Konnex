import Link from "next/link";
import { Globe, MapPin, ServerCog, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { DataSourceBanner } from "@/components/data-source-banner";
import { RobotMap, type MapMarker } from "@/components/robot-map";
import { getAllAxons, getChainStats } from "@/lib/konnex/queries";
import { geolocateIps } from "@/lib/konnex/geo";
import { formatNumber } from "@/lib/format";

export const revalidate = 60;

export const metadata = {
  title: "Robot world map",
};

export default async function MapPage() {
  const [axonsResult, statsResult] = await Promise.all([
    getAllAxons(),
    getChainStats(),
  ]);
  const axons = axonsResult.value;
  const uniqueIps = Array.from(new Set(axons.map((a) => a.ip).filter(Boolean)));
  const geo = await geolocateIps(uniqueIps);

  const markers: MapMarker[] = [];
  for (const a of axons) {
    const g = geo.get(a.ip);
    if (!g?.ok || g.lat == null || g.lng == null) continue;
    markers.push({
      netuid: a.netuid,
      subnetName: a.subnetName,
      uid: a.uid,
      hotkey: a.hotkey,
      ip: a.ip,
      port: a.port,
      alphaStake: a.alphaStake,
      validatorPermit: a.validatorPermit,
      active: a.active,
      lat: g.lat,
      lng: g.lng,
      country: g.country ?? "—",
      city: g.city ?? "—",
      isp: g.isp ?? "",
    });
  }

  const byCountry = new Map<string, number>();
  for (const m of markers)
    byCountry.set(m.country, (byCountry.get(m.country) ?? 0) + 1);
  const topCountries = Array.from(byCountry.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  const byCity = new Map<string, number>();
  for (const m of markers) {
    const k = `${m.city}, ${m.country}`;
    byCity.set(k, (byCity.get(k) ?? 0) + 1);
  }
  const topCities = Array.from(byCity.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const byIsp = new Map<string, number>();
  for (const m of markers) {
    if (!m.isp) continue;
    byIsp.set(m.isp, (byIsp.get(m.isp) ?? 0) + 1);
  }
  const topIsps = Array.from(byIsp.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const bySubnet = new Map<number, { name: string; count: number }>();
  for (const m of markers) {
    const prev = bySubnet.get(m.netuid);
    bySubnet.set(m.netuid, {
      name: m.subnetName,
      count: (prev?.count ?? 0) + 1,
    });
  }
  const subnetBreakdown = Array.from(bySubnet.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="space-y-3">
        <DataSourceBanner
          live={axonsResult.live}
          block={statsResult.value.block}
          endpoint={axonsResult.endpoint}
        />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Robot world map
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Every axon endpoint advertised on Konnex testnet, geolocated from its
          IPv4 address. Konnex is a physical-AI network — these are the actual
          machines.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Mapped neurons"
          value={formatNumber(markers.length)}
          hint={`of ${formatNumber(axons.length)} advertised axons`}
          icon={<ServerCog className="h-4 w-4" />}
        />
        <StatCard
          label="Countries"
          value={formatNumber(topCountries.length)}
          hint="distinct flags"
          icon={<Globe className="h-4 w-4" />}
        />
        <StatCard
          label="Cities"
          value={formatNumber(byCity.size)}
          hint="distinct datapoints"
          icon={<MapPin className="h-4 w-4" />}
        />
        <StatCard
          label="Validators"
          value={formatNumber(markers.filter((m) => m.validatorPermit).length)}
          hint="larger, outlined markers"
          icon={<Shield className="h-4 w-4" />}
        />
      </section>

      <RobotMap markers={markers} center={[35, 0]} zoom={2} />

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="py-0">
          <CardContent className="p-0">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Top countries</h2>
              <p className="text-xs text-muted-foreground">
                Where Konnex robots actually live
              </p>
            </div>
            <ul className="divide-y text-sm">
              {topCountries.slice(0, 10).map(([country, count]) => (
                <li
                  key={country}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span>{country}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-0">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Top cities</h2>
              <p className="text-xs text-muted-foreground">
                Densest physical clusters
              </p>
            </div>
            <ul className="divide-y text-sm">
              {topCities.map(([city, count]) => (
                <li
                  key={city}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="truncate pr-2">{city}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-0">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Top hosts</h2>
              <p className="text-xs text-muted-foreground">
                ISP / cloud providers used
              </p>
            </div>
            <ul className="divide-y text-sm">
              {topIsps.map(([isp, count]) => (
                <li
                  key={isp}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="truncate pr-2 text-xs">{isp}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card className="py-0">
        <CardContent className="p-0">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Subnet breakdown</h2>
            <p className="text-xs text-muted-foreground">
              Mapped neurons by workload class
            </p>
          </div>
          <ul className="divide-y text-sm">
            {subnetBreakdown.map(([netuid, info]) => (
              <li
                key={netuid}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <Link
                  href={`/subnet/${netuid}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <span className="font-mono text-[10px] text-muted-foreground">
                    netuid {netuid}
                  </span>
                  <span>{info.name}</span>
                </Link>
                <span className="tabular-nums text-muted-foreground">
                  {info.count}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
