export type SubnetId = "drone-nav" | "roboarm" | "slam";

export type SubnetMeta = {
  id: SubnetId;
  name: string;
  shortName: string;
  description: string;
  status: "live" | "in-development";
  color: string;
};

export type RobotStatus = "active" | "idle" | "offline" | "slashed";

export type TrustTier = "Bronze" | "Silver" | "Gold" | "Diamond";

export type Robot = {
  id: string;
  name: string;
  subnet: SubnetId;
  owner: string;
  hardwareId: string;
  teeAttested: boolean;
  registeredAt: Date;
  lastSeenAt: Date;
  status: RobotStatus;
  totalMissions: number;
  successfulMissions: number;
  totalEarnedKnx: number;
  totalEarnedUsdc: number;
  avgScore: number;
  trustScore: number;
  trustTier: TrustTier;
};

export type MissionStatus =
  | "pending"
  | "executing"
  | "validating"
  | "settled"
  | "failed";

export type ValidatorScore = {
  validatorId: string;
  safety: number;
  accuracy: number;
  efficiency: number;
  submittedAt: Date;
};

export type GpsPoint = {
  t: number;
  lat: number;
  lng: number;
  alt: number;
};

export type SensorSample = {
  t: number;
  speed: number;
  accelMag: number;
  gyroMag: number;
  temp: number;
  battery: number;
};

export type Mission = {
  id: string;
  robotId: string;
  subnet: SubnetId;
  instruction: string;
  instructionHash: string;
  status: MissionStatus;
  createdAt: Date;
  completedAt: Date | null;
  durationSec: number;
  rewardAmount: number;
  rewardToken: "KNX" | "USDC";
  popwBundleCid: string;
  avgScore: number;
  scores: ValidatorScore[];
  trajectory: GpsPoint[];
  sensorSeries: SensorSample[];
};

export type Validator = {
  id: string;
  name: string;
  subnet: SubnetId;
  stakeKnx: number;
  stakeUsdc: number;
  missionsValidated: number;
  agreementRate: number;
  status: "active" | "slashed";
  joinedAt: Date;
};

export type SearchHit = {
  kind: "robot" | "mission" | "validator" | "subnet";
  id: string;
  label: string;
  sublabel: string;
  href: string;
};

export type LiveStats = {
  totalRobots: number;
  activeRobots: number;
  totalMissions: number;
  missionsLast24h: number;
  totalValidators: number;
  activeValidators: number;
  avgRewardKnx24h: number;
  totalKnxSettled: number;
};
