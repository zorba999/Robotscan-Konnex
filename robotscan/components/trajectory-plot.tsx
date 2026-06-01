import type { GpsPoint } from "@/lib/types";

export function TrajectoryPlot({
  points,
  color = "#3b82f6",
}: {
  points: GpsPoint[];
  color?: string;
}) {
  if (points.length === 0) {
    return (
      <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">
        No GPS trajectory data for this mission.
      </div>
    );
  }

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const alts = points.map((p) => p.alt);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minAlt = Math.min(...alts);
  const maxAlt = Math.max(...alts);

  const padLat = (maxLat - minLat) * 0.1 || 0.0005;
  const padLng = (maxLng - minLng) * 0.1 || 0.0005;
  const bbox = {
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
    minLng: minLng - padLng,
    maxLng: maxLng + padLng,
  };

  const W = 720;
  const H = 320;

  function project(lat: number, lng: number): [number, number] {
    const x = ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * W;
    const y = H - ((lat - bbox.minLat) / (bbox.maxLat - bbox.minLat)) * H;
    return [x, y];
  }

  const pathD = points
    .map((p, i) => {
      const [x, y] = project(p.lat, p.lng);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const start = project(points[0].lat, points[0].lng);
  const end = project(
    points[points.length - 1].lat,
    points[points.length - 1].lng,
  );

  const totalKm = (() => {
    let d = 0;
    for (let i = 1; i < points.length; i++) {
      const dLat = (points[i].lat - points[i - 1].lat) * 110.574;
      const dLng =
        (points[i].lng - points[i - 1].lng) *
        111.32 *
        Math.cos((points[i].lat * Math.PI) / 180);
      d += Math.sqrt(dLat * dLat + dLng * dLng);
    }
    return d;
  })();

  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50/40 to-emerald-50/40 dark:from-blue-950/20 dark:to-emerald-950/20">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-border"
            />
          </pattern>
          <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {points.map((p, i) => {
          if (i % 8 !== 0) return null;
          const [x, y] = project(p.lat, p.lng);
          const altT = (p.alt - minAlt) / Math.max(0.001, maxAlt - minAlt);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1.6}
              fill={color}
              opacity={0.25 + 0.55 * altT}
            />
          );
        })}

        <path
          d={pathD}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <g>
          <circle
            cx={start[0]}
            cy={start[1]}
            r={7}
            fill="white"
            stroke="#10b981"
            strokeWidth={2.5}
          />
          <text
            x={start[0] + 12}
            y={start[1] + 4}
            fontSize={11}
            fill="#10b981"
            fontWeight={600}
            className="font-mono"
          >
            START
          </text>
        </g>
        <g>
          <circle
            cx={end[0]}
            cy={end[1]}
            r={7}
            fill="white"
            stroke="#ef4444"
            strokeWidth={2.5}
          />
          <text
            x={end[0] + 12}
            y={end[1] + 4}
            fontSize={11}
            fill="#ef4444"
            fontWeight={600}
            className="font-mono"
          >
            END
          </text>
        </g>
      </svg>
      <div className="pointer-events-none absolute bottom-2 right-2 flex gap-2">
        <div className="rounded-md border bg-background/80 backdrop-blur px-2 py-1 text-[10px] font-mono text-muted-foreground">
          {points.length} waypoints
        </div>
        <div className="rounded-md border bg-background/80 backdrop-blur px-2 py-1 text-[10px] font-mono text-muted-foreground">
          {totalKm.toFixed(2)} km
        </div>
        <div className="rounded-md border bg-background/80 backdrop-blur px-2 py-1 text-[10px] font-mono text-muted-foreground">
          alt {minAlt.toFixed(0)}–{maxAlt.toFixed(0)}m
        </div>
      </div>
    </div>
  );
}
