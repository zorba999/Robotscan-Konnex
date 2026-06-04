"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

export type MapMarker = {
  netuid: number;
  subnetName: string;
  uid: number;
  hotkey: string;
  ip: string;
  port: number;
  alphaStake: number;
  validatorPermit: boolean;
  active: boolean;
  lat: number;
  lng: number;
  country: string;
  city: string;
  isp: string;
};

const SUBNET_COLORS = [
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#8b5cf6",
  "#22c55e",
  "#eab308",
  "#0ea5e9",
];

export function colorForSubnet(netuid: number): string {
  return SUBNET_COLORS[netuid % SUBNET_COLORS.length];
}

const InnerMap = dynamic(() => import("./robot-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full grid place-items-center rounded-xl border bg-muted/30 text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export function RobotMap(props: {
  markers: MapMarker[];
  center: [number, number];
  zoom: number;
}) {
  return <InnerMap {...props} />;
}
