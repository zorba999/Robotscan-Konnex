import { Faker, en } from "@faker-js/faker";
import type {
  GpsPoint,
  Mission,
  MissionStatus,
  Robot,
  RobotStatus,
  SensorSample,
  SubnetId,
  TrustTier,
  Validator,
  ValidatorScore,
} from "./types";
import { SUBNET_LIST } from "./subnets";

const SEED = 20260601;

function makeFaker(seedOffset = 0): Faker {
  const f = new Faker({ locale: [en] });
  f.seed(SEED + seedOffset);
  return f;
}

function pseudoHex(f: Faker, len: number): string {
  let out = "";
  const chars = "0123456789abcdef";
  for (let i = 0; i < len; i++) {
    out += chars[f.number.int({ min: 0, max: 15 })];
  }
  return out;
}

function knxAddress(f: Faker): string {
  return "0x" + pseudoHex(f, 40);
}

function bundleCid(f: Faker): string {
  return "bafy" + pseudoHex(f, 52);
}

function tier(score: number): TrustTier {
  if (score >= 900) return "Diamond";
  if (score >= 750) return "Gold";
  if (score >= 500) return "Silver";
  return "Bronze";
}

function robotNameFor(f: Faker, subnet: SubnetId, idx: number): string {
  const prefixes: Record<SubnetId, string[]> = {
    "drone-nav": ["sky", "falcon", "aero", "swift", "kite", "raven", "drift"],
    roboarm: ["arm", "grip", "vesper", "kraft", "manus", "atlas", "nimbus"],
    slam: ["scout", "atlas", "voxel", "lidar", "echo", "prism", "carto"],
  };
  const word = f.helpers.arrayElement(prefixes[subnet]);
  return `${word}-${String(idx).padStart(3, "0")}`;
}

function generateRobots(): Robot[] {
  const f = makeFaker(1);
  const robots: Robot[] = [];
  const counts: Record<SubnetId, number> = {
    "drone-nav": 28,
    roboarm: 12,
    slam: 18,
  };

  let idxBySubnet: Record<SubnetId, number> = {
    "drone-nav": 1,
    roboarm: 1,
    slam: 1,
  };

  for (const sn of SUBNET_LIST) {
    const n = counts[sn.id];
    for (let i = 0; i < n; i++) {
      const idx = idxBySubnet[sn.id]++;
      const totalMissions = f.number.int({ min: 12, max: 540 });
      const successRate = f.number.float({ min: 0.78, max: 0.99 });
      const successfulMissions = Math.floor(totalMissions * successRate);
      const avgScore = f.number.float({ min: 0.74, max: 0.98 });
      const trustScore = Math.min(
        1000,
        Math.floor(avgScore * 750 + successRate * 250 + f.number.int({ min: -40, max: 40 })),
      );
      const statusRoll = f.number.float({ min: 0, max: 1 });
      let status: RobotStatus;
      if (statusRoll < 0.62) status = "active";
      else if (statusRoll < 0.88) status = "idle";
      else if (statusRoll < 0.97) status = "offline";
      else status = "slashed";

      const registeredAt = f.date.past({ years: 1, refDate: "2026-06-01" });
      const lastSeenAt =
        status === "active"
          ? f.date.recent({ days: 1, refDate: "2026-06-01" })
          : status === "idle"
            ? f.date.recent({ days: 3, refDate: "2026-06-01" })
            : f.date.recent({ days: 30, refDate: "2026-06-01" });

      const earnedKnx = f.number.float({ min: 2, max: 280 });
      const earnedUsdc = f.number.float({ min: 0, max: 1400 });

      robots.push({
        id: "0x" + pseudoHex(f, 40),
        name: robotNameFor(f, sn.id, idx),
        subnet: sn.id,
        owner: knxAddress(f),
        hardwareId: "TEE-" + pseudoHex(f, 16).toUpperCase(),
        teeAttested: f.number.float({ min: 0, max: 1 }) > 0.05,
        registeredAt,
        lastSeenAt,
        status,
        totalMissions,
        successfulMissions,
        totalEarnedKnx: Number(earnedKnx.toFixed(2)),
        totalEarnedUsdc: Number(earnedUsdc.toFixed(2)),
        avgScore: Number(avgScore.toFixed(3)),
        trustScore,
        trustTier: tier(trustScore),
      });
    }
  }

  return robots;
}

function generateValidators(): Validator[] {
  const f = makeFaker(2);
  const validators: Validator[] = [];
  const namePool = [
    "konnex-labs",
    "popw-prime",
    "blockchain-watch",
    "trustnode",
    "veriprime",
    "atlas-validators",
    "merkle-eye",
    "consensus-co",
    "deepscore",
    "northwatch",
    "popw-guard",
    "verified-systems",
  ];

  let i = 0;
  for (const sn of SUBNET_LIST) {
    const n = f.number.int({ min: 4, max: 7 });
    for (let j = 0; j < n; j++) {
      validators.push({
        id: knxAddress(f),
        name:
          namePool[i % namePool.length] +
          "-" +
          sn.id.replace("-", "").slice(0, 3),
        subnet: sn.id,
        stakeKnx: f.number.int({ min: 12_000, max: 480_000 }),
        stakeUsdc: f.number.int({ min: 8_000, max: 320_000 }),
        missionsValidated: f.number.int({ min: 240, max: 9800 }),
        agreementRate: Number(
          f.number.float({ min: 0.86, max: 0.998 }).toFixed(4),
        ),
        status:
          f.number.float({ min: 0, max: 1 }) > 0.97 ? "slashed" : "active",
        joinedAt: f.date.past({ years: 1, refDate: "2026-06-01" }),
      });
      i++;
    }
  }
  return validators;
}

function generateGpsTrajectory(f: Faker, durationSec: number): GpsPoint[] {
  const baseLat = f.number.float({ min: 31.5, max: 35.5 });
  const baseLng = f.number.float({ min: -8.5, max: -4.5 });
  const steps = Math.max(20, Math.floor(durationSec / 4));
  const pts: GpsPoint[] = [];
  let lat = baseLat;
  let lng = baseLng;
  let alt = f.number.float({ min: 20, max: 80 });
  for (let i = 0; i < steps; i++) {
    lat += f.number.float({ min: -0.0006, max: 0.0006 });
    lng += f.number.float({ min: -0.0006, max: 0.0006 });
    alt += f.number.float({ min: -1.5, max: 1.5 });
    pts.push({
      t: i * (durationSec / steps),
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      alt: Number(Math.max(5, alt).toFixed(1)),
    });
  }
  return pts;
}

function generateSensorSeries(f: Faker, durationSec: number): SensorSample[] {
  const steps = Math.max(40, Math.floor(durationSec / 2));
  const out: SensorSample[] = [];
  let battery = f.number.float({ min: 92, max: 100 });
  for (let i = 0; i < steps; i++) {
    battery -= f.number.float({ min: 0.05, max: 0.18 });
    out.push({
      t: i * (durationSec / steps),
      speed: Number(f.number.float({ min: 0.4, max: 12.5 }).toFixed(2)),
      accelMag: Number(f.number.float({ min: 0.5, max: 4.5 }).toFixed(2)),
      gyroMag: Number(f.number.float({ min: 0.1, max: 2.2 }).toFixed(2)),
      temp: Number(f.number.float({ min: 24, max: 42 }).toFixed(1)),
      battery: Number(Math.max(0, battery).toFixed(1)),
    });
  }
  return out;
}

const INSTRUCTION_TEMPLATES: Record<SubnetId, string[]> = {
  "drone-nav": [
    "Inspect solar panel array A1-A50 at 60s/panel",
    "Survey perimeter of warehouse #12 with thermal camera",
    "Map wind turbine blades for cracks (resolution 4cm)",
    "Patrol fence line 2.4km, log anomalies",
    "Deliver payload to GPS 32.41/-7.84, return to base",
  ],
  roboarm: [
    "Pick 24 components from bin B and place on conveyor",
    "Sort 50 packages by barcode into 4 chutes",
    "Assemble fixture #7 per spec drawing #2104",
    "Inspect weld seams on 12 frames, flag defects",
    "Stack 36 cartons onto pallet, max height 1.6m",
  ],
  slam: [
    "Map basement level B2 (~840 m²) at 2cm resolution",
    "Generate 3D point cloud of construction site sector C",
    "Update floor plan of office building, detect changes",
    "Survey underground tunnel 320m, log obstacles",
    "Scan retail store for inventory layout audit",
  ],
};

function generateMissionsForRobot(
  robot: Robot,
  count: number,
  seedOffset: number,
): Mission[] {
  const f = makeFaker(seedOffset);
  const missions: Mission[] = [];
  for (let i = 0; i < count; i++) {
    const isRecent = i < count * 0.4;
    const fromDate = robot.registeredAt;
    const refTo = new Date("2026-05-01").getTime();
    const minSpan = 14 * 86400_000;
    const toDate = new Date(Math.max(refTo, fromDate.getTime() + minSpan));
    const createdAt = isRecent
      ? f.date.recent({ days: 30, refDate: "2026-06-01" })
      : f.date.between({ from: fromDate, to: toDate });
    const durationSec = f.number.int({ min: 45, max: 1200 });
    const completedAt = new Date(createdAt.getTime() + durationSec * 1000);
    const statusRoll = f.number.float({ min: 0, max: 1 });
    let status: MissionStatus;
    if (statusRoll < 0.86) status = "settled";
    else if (statusRoll < 0.92) status = "validating";
    else if (statusRoll < 0.96) status = "executing";
    else if (statusRoll < 0.98) status = "pending";
    else status = "failed";

    const scores: ValidatorScore[] = [];
    const scoreCount = f.number.int({ min: 2, max: 4 });
    for (let k = 0; k < scoreCount; k++) {
      scores.push({
        validatorId: "0x" + pseudoHex(f, 40),
        safety: Number(f.number.float({ min: 0.78, max: 1 }).toFixed(3)),
        accuracy: Number(f.number.float({ min: 0.72, max: 0.99 }).toFixed(3)),
        efficiency: Number(f.number.float({ min: 0.7, max: 0.99 }).toFixed(3)),
        submittedAt: new Date(completedAt.getTime() + 1000 * 60 * 5),
      });
    }
    const avgScore =
      scores.reduce(
        (acc, s) => acc + (s.safety + s.accuracy + s.efficiency) / 3,
        0,
      ) / scores.length;

    const instruction = f.helpers.arrayElement(
      INSTRUCTION_TEMPLATES[robot.subnet],
    );

    missions.push({
      id: "0x" + pseudoHex(f, 64),
      robotId: robot.id,
      subnet: robot.subnet,
      instruction,
      instructionHash: "0x" + pseudoHex(f, 64),
      status,
      createdAt,
      completedAt: status === "settled" || status === "validating" ? completedAt : null,
      durationSec,
      rewardAmount: Number(
        f.number.float({ min: 0.05, max: 4.2 }).toFixed(3),
      ),
      rewardToken: f.helpers.arrayElement(["KNX", "USDC"]),
      popwBundleCid: bundleCid(f),
      avgScore: Number(avgScore.toFixed(3)),
      scores,
      trajectory:
        robot.subnet === "drone-nav" || robot.subnet === "slam"
          ? generateGpsTrajectory(f, durationSec)
          : [],
      sensorSeries: generateSensorSeries(f, durationSec),
    });
  }
  return missions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function generateAllMissions(robots: Robot[]): Mission[] {
  const all: Mission[] = [];
  robots.forEach((r, idx) => {
    const count = Math.min(12, Math.max(4, Math.floor(r.totalMissions / 18)));
    all.push(...generateMissionsForRobot(r, count, 100 + idx));
  });
  return all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

let cachedRobots: Robot[] | null = null;
let cachedMissions: Mission[] | null = null;
let cachedValidators: Validator[] | null = null;

export function getRobots(): Robot[] {
  if (!cachedRobots) cachedRobots = generateRobots();
  return cachedRobots;
}

export function getMissions(): Mission[] {
  if (!cachedMissions) cachedMissions = generateAllMissions(getRobots());
  return cachedMissions;
}

export function getValidators(): Validator[] {
  if (!cachedValidators) cachedValidators = generateValidators();
  return cachedValidators;
}

export function getRobotById(id: string): Robot | null {
  return getRobots().find((r) => r.id === id) ?? null;
}

export function getMissionById(id: string): Mission | null {
  return getMissions().find((m) => m.id === id) ?? null;
}

export function getValidatorById(id: string): Validator | null {
  return getValidators().find((v) => v.id === id) ?? null;
}

export function getMissionsByRobotId(robotId: string, limit?: number): Mission[] {
  const list = getMissions().filter((m) => m.robotId === robotId);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getMissionsBySubnet(
  subnet: SubnetId,
  limit?: number,
): Mission[] {
  const list = getMissions().filter((m) => m.subnet === subnet);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getRobotsBySubnet(
  subnet: SubnetId,
  sortBy: "trustScore" | "totalEarned" | "missions" = "trustScore",
): Robot[] {
  const list = getRobots().filter((r) => r.subnet === subnet);
  return list.sort((a, b) => {
    if (sortBy === "totalEarned")
      return b.totalEarnedKnx - a.totalEarnedKnx;
    if (sortBy === "missions") return b.totalMissions - a.totalMissions;
    return b.trustScore - a.trustScore;
  });
}

export function getValidatorsBySubnet(subnet: SubnetId): Validator[] {
  return getValidators().filter((v) => v.subnet === subnet);
}

export function getLiveStats() {
  const robots = getRobots();
  const missions = getMissions();
  const validators = getValidators();
  const cutoff24h = new Date("2026-06-01T00:00:00Z").getTime();
  const recent = missions.filter((m) => m.createdAt.getTime() >= cutoff24h - 86400_000);
  const totalKnx = missions
    .filter((m) => m.rewardToken === "KNX" && m.status === "settled")
    .reduce((acc, m) => acc + m.rewardAmount, 0);
  const avgReward =
    recent.length > 0
      ? recent.reduce((acc, m) => acc + m.rewardAmount, 0) / recent.length
      : 0;
  return {
    totalRobots: robots.length,
    activeRobots: robots.filter((r) => r.status === "active").length,
    totalMissions: missions.length,
    missionsLast24h: recent.length,
    totalValidators: validators.length,
    activeValidators: validators.filter((v) => v.status === "active").length,
    avgRewardKnx24h: Number(avgReward.toFixed(3)),
    totalKnxSettled: Number(totalKnx.toFixed(1)),
  };
}

export function searchAll(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: {
    kind: "robot" | "mission" | "validator" | "subnet";
    id: string;
    label: string;
    sublabel: string;
    href: string;
  }[] = [];

  for (const r of getRobots()) {
    if (
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.owner.toLowerCase().includes(q)
    ) {
      hits.push({
        kind: "robot",
        id: r.id,
        label: r.name,
        sublabel: r.id,
        href: `/robot/${r.id}`,
      });
    }
    if (hits.length >= 12) break;
  }

  for (const m of getMissions()) {
    if (m.id.toLowerCase().includes(q)) {
      hits.push({
        kind: "mission",
        id: m.id,
        label: m.instruction,
        sublabel: m.id,
        href: `/mission/${m.id}`,
      });
    }
    if (hits.length >= 18) break;
  }

  for (const v of getValidators()) {
    if (
      v.name.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q)
    ) {
      hits.push({
        kind: "validator",
        id: v.id,
        label: v.name,
        sublabel: v.id,
        href: `/validator/${v.id}`,
      });
    }
    if (hits.length >= 24) break;
  }

  for (const sn of SUBNET_LIST) {
    if (
      sn.name.toLowerCase().includes(q) ||
      sn.id.toLowerCase().includes(q)
    ) {
      hits.push({
        kind: "subnet",
        id: sn.id,
        label: sn.name,
        sublabel: sn.description,
        href: `/subnet/${sn.id}`,
      });
    }
  }

  return hits.slice(0, 24);
}
