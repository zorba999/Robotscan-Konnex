import "server-only";

export type GeoInfo = {
  ip: string;
  ok: boolean;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  lat?: number;
  lng?: number;
  isp?: string;
  org?: string;
  as?: string;
};

type GeoCache = {
  map: Map<string, GeoInfo>;
  inFlight: Map<string, Promise<void>>;
};

const g = globalThis as unknown as { __knxGeo?: GeoCache };
g.__knxGeo ??= { map: new Map(), inFlight: new Map() };
const cache = g.__knxGeo;

const PRIVATE_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^0\./,
];

function isPrivateOrInvalid(ip: string): boolean {
  if (!ip) return true;
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return true;
  return PRIVATE_RANGES.some((r) => r.test(ip));
}

async function fetchBatch(ips: string[]): Promise<GeoInfo[]> {
  if (ips.length === 0) return [];
  const body = ips.map((q) => ({ query: q }));
  try {
    const res = await fetch("http://ip-api.com/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate: false },
    });
    if (!res.ok) throw new Error(`ip-api ${res.status}`);
    const data = (await res.json()) as Array<{
      status: string;
      query: string;
      country?: string;
      countryCode?: string;
      regionName?: string;
      city?: string;
      lat?: number;
      lon?: number;
      isp?: string;
      org?: string;
      as?: string;
      message?: string;
    }>;

    return data.map((d) => {
      if (d.status !== "success") {
        return { ip: d.query, ok: false };
      }
      return {
        ip: d.query,
        ok: true,
        country: d.country,
        countryCode: d.countryCode,
        region: d.regionName,
        city: d.city,
        lat: d.lat,
        lng: d.lon,
        isp: d.isp,
        org: d.org,
        as: d.as,
      };
    });
  } catch (err) {
    console.warn("[geo] batch lookup failed:", (err as Error).message);
    return ips.map((ip) => ({ ip, ok: false }));
  }
}

const BATCH_SIZE = 100;

export async function geolocateIps(
  ips: string[],
): Promise<Map<string, GeoInfo>> {
  const result = new Map<string, GeoInfo>();
  const toFetch: string[] = [];

  const seen = new Set<string>();
  for (const ip of ips) {
    if (seen.has(ip)) continue;
    seen.add(ip);
    if (isPrivateOrInvalid(ip)) {
      result.set(ip, { ip, ok: false });
      continue;
    }
    const cached = cache.map.get(ip);
    if (cached) {
      result.set(ip, cached);
      continue;
    }
    if (cache.inFlight.has(ip)) {
      // Will await below
      continue;
    }
    toFetch.push(ip);
  }

  // Await any in-flight lookups for IPs we need
  const waits: Promise<void>[] = [];
  for (const ip of ips) {
    const pending = cache.inFlight.get(ip);
    if (pending && !result.has(ip)) waits.push(pending);
  }
  if (waits.length) await Promise.all(waits);
  for (const ip of ips) {
    if (!result.has(ip)) {
      const cached = cache.map.get(ip);
      if (cached) result.set(ip, cached);
    }
  }

  // Batch the un-cached uniques in groups of 100
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const slice = toFetch.slice(i, i + BATCH_SIZE);
    const promise = (async () => {
      const infos = await fetchBatch(slice);
      for (const info of infos) {
        cache.map.set(info.ip, info);
        result.set(info.ip, info);
      }
    })();
    for (const ip of slice) cache.inFlight.set(ip, promise);
    try {
      await promise;
    } finally {
      for (const ip of slice) cache.inFlight.delete(ip);
    }
  }

  // Fill in anything that was in-flight but not in our toFetch batch
  for (const ip of ips) {
    if (!result.has(ip)) {
      const cached = cache.map.get(ip);
      result.set(ip, cached ?? { ip, ok: false });
    }
  }

  return result;
}

export function geoCacheStats() {
  return {
    cached: cache.map.size,
    inFlight: cache.inFlight.size,
  };
}
