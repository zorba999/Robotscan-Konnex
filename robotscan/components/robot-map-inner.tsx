"use client";

import * as React from "react";
import Link from "next/link";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  Popup,
  useMap,
} from "react-leaflet";
import { type MapMarker, colorForSubnet } from "./robot-map";

function FitToMarkers({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (!markers.length) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
  }, [map, markers]);
  return null;
}

// Add deterministic jitter so co-located markers don't fully overlap.
function jitter(seed: string): [number, number] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const dx = (((h >>> 0) % 1000) / 1000 - 0.5) * 0.5;
  const dy = ((((h >>> 8) >>> 0) % 1000) / 1000 - 0.5) * 0.5;
  return [dx, dy];
}

export default function RobotMapInner({
  markers,
  center,
  zoom,
}: {
  markers: MapMarker[];
  center: [number, number];
  zoom: number;
}) {
  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl border bg-zinc-950">
      <MapContainer
        center={center}
        zoom={zoom}
        worldCopyJump
        scrollWheelZoom
        style={{ height: "100%", width: "100%", background: "#09090b" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <FitToMarkers markers={markers} />
        {markers.map((m, i) => {
          const [dx, dy] = jitter(`${m.netuid}-${m.uid}-${m.hotkey}`);
          const lat = m.lat + dy;
          const lng = m.lng + dx;
          const color = colorForSubnet(m.netuid);
          const radius = m.validatorPermit ? 8 : 5;
          return (
            <CircleMarker
              key={`${m.netuid}-${m.uid}-${i}`}
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: m.active ? 0.85 : 0.35,
                weight: m.validatorPermit ? 2 : 1,
                opacity: m.active ? 1 : 0.5,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                <div className="text-xs">
                  <div className="font-semibold">{m.subnetName}</div>
                  <div className="font-mono">
                    UID {m.uid} · {m.city}, {m.country}
                  </div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-xs space-y-1.5 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold">{m.subnetName}</span>
                    <span className="text-muted-foreground font-mono">
                      netuid {m.netuid}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    UID {m.uid} ·{" "}
                    {m.validatorPermit ? (
                      <span className="text-blue-600 font-medium">
                        Validator
                      </span>
                    ) : (
                      "Miner"
                    )}
                  </div>
                  <div className="font-mono text-[11px] break-all">
                    {m.hotkey}
                  </div>
                  <div className="font-mono text-[11px]">
                    {m.ip}:{m.port}
                  </div>
                  <div className="text-[11px]">
                    {m.city}, {m.country} ·{" "}
                    <span className="text-muted-foreground">{m.isp}</span>
                  </div>
                  <div className="text-[11px]">
                    α stake:{" "}
                    <span className="font-medium">
                      {m.alphaStake.toFixed(4)} tKNX
                    </span>
                  </div>
                  <Link
                    href={`/robot/${m.hotkey}`}
                    className="!text-blue-600 hover:underline inline-block mt-1"
                  >
                    View neuron →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
