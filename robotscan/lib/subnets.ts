import type { SubnetId, SubnetMeta } from "./types";

export const SUBNETS: Record<SubnetId, SubnetMeta> = {
  "drone-nav": {
    id: "drone-nav",
    name: "Drone Navigation & Swarm",
    shortName: "Drone Nav",
    description:
      "Autonomous aerial inspection, navigation, and multi-drone coordination.",
    status: "live",
    color: "#2563eb",
  },
  roboarm: {
    id: "roboarm",
    name: "Roboarm Manipulation",
    shortName: "Roboarm",
    description:
      "Vision-Language-Action models for robotic arm pick-and-place tasks.",
    status: "in-development",
    color: "#9333ea",
  },
  slam: {
    id: "slam",
    name: "SLAM / 3D Mapping",
    shortName: "SLAM",
    description:
      "Simultaneous Localization and Mapping for spatial perception.",
    status: "live",
    color: "#16a34a",
  },
};

export const SUBNET_LIST: SubnetMeta[] = Object.values(SUBNETS);

export function getSubnet(id: SubnetId): SubnetMeta {
  return SUBNETS[id];
}
