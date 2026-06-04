import "server-only";
import type { ApiPromise } from "@polkadot/api";
import { withApi, RPC_ENDPOINT } from "./client";
import { hexToUtf8, ipFromU32, raoToTknx } from "./decode";

export type LiveResult<T> = {
  value: T;
  live: boolean;
  error?: string;
  endpoint: string;
};

export type ChainStats = {
  chain: string;
  nodeName: string;
  version: string;
  block: number;
  finalizedHash: string;
  peers: number;
  isSyncing: boolean;
  totalSubnets: number;
  totalIssuance: number;
  totalStake: number;
  totalNeurons: number;
  totalEscrows: number;
};

export type Subnet = {
  netuid: number;
  name: string;
  description: string;
  githubRepo: string;
  contact: string;
  url: string;
  discord: string;
  additional: string;
  owner: string;
  neurons: number;
  emission: number;
};

export type Neuron = {
  netuid: number;
  uid: number;
  hotkey: string;
  coldkey: string | null;
  ip: string;
  port: number;
  ipVersion: number;
  protocol: number;
  axonBlock: number;
  axonVersion: number;
  alphaStake: number;
  active: boolean;
  validatorPermit: boolean;
  emission: number;
};

export type Escrow = {
  subnetId: number;
  taskId: string;
  payer: string;
  payee: string;
  amount: number;
  descriptionHash: string;
  deadline: number;
  resolverCount: number;
  approvals: number;
  rejections: number;
  status: "awaiting_release" | "released" | "refunded";
};

async function readChainStats(api: ApiPromise): Promise<ChainStats> {
  const [chain, nodeName, version, props, health, head, finalized] =
    await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version(),
      api.rpc.system.properties(),
      api.rpc.system.health(),
      api.rpc.chain.getHeader(),
      api.rpc.chain.getFinalizedHead(),
    ]);
  void props;

  const [totalNetworks, totalIssuance, totalStake, networksAdded] =
    await Promise.all([
      api.query.subtensorModule.totalNetworks(),
      api.query.balances.totalIssuance(),
      api.query.subtensorModule.totalStake(),
      api.query.subtensorModule.networksAdded.entries(),
    ]);

  const existingNetuids = networksAdded
    .filter(([, val]) => val.toJSON() === true)
    .map(([key]) => (key.args[0] as unknown as { toNumber: () => number }).toNumber())
    .sort((a, b) => a - b);

  let totalNeurons = 0;
  await Promise.all(
    existingNetuids.map(async (netuid) => {
      try {
        const n = await api.query.subtensorModule.subnetworkN(netuid);
        totalNeurons += Number(n.toString());
      } catch {}
    }),
  );

  let totalEscrows = 0;
  try {
    if (api.query.konnexEscrow?.escrows?.entries) {
      const entries = await api.query.konnexEscrow.escrows.entries();
      totalEscrows = entries.length;
    }
  } catch {}

  return {
    chain: chain.toString(),
    nodeName: nodeName.toString(),
    version: version.toString(),
    block: head.number.toNumber(),
    finalizedHash: finalized.toHex(),
    peers: Number(health.peers.toString()),
    isSyncing: health.isSyncing.valueOf(),
    totalSubnets: Number(totalNetworks.toString()),
    totalIssuance: raoToTknx(totalIssuance.toString()),
    totalStake: raoToTknx(totalStake.toString()),
    totalNeurons,
    totalEscrows,
  };
}

async function readSubnets(api: ApiPromise): Promise<Subnet[]> {
  const networksAdded = await api.query.subtensorModule.networksAdded.entries();
  const netuids = networksAdded
    .filter(([, val]) => val.toJSON() === true)
    .map(([key]) => (key.args[0] as unknown as { toNumber: () => number }).toNumber())
    .sort((a, b) => a - b);

  return Promise.all(
    netuids.map(async (netuid): Promise<Subnet> => {
      const [neurons, owner, identityRaw, emission] = await Promise.all([
        api.query.subtensorModule.subnetworkN(netuid).catch(() => null),
        api.query.subtensorModule.subnetOwner?.(netuid).catch(() => null) ?? Promise.resolve(null),
        api.query.subtensorModule.subnetIdentitiesV3?.(netuid).catch(() => null) ??
          api.query.subtensorModule.subnetIdentitiesV2?.(netuid).catch(() => null) ??
          api.query.subtensorModule.subnetIdentities?.(netuid).catch(() => null) ??
          Promise.resolve(null),
        api.query.subtensorModule.emissionValues?.(netuid).catch(() => null) ??
          Promise.resolve(null),
      ]);

      const identity = identityRaw ? (identityRaw as unknown as { toJSON: () => Record<string, unknown> | null }).toJSON() : null;
      const get = (k: string) =>
        identity && typeof identity === "object"
          ? hexToUtf8(identity[k] as string)
          : "";

      return {
        netuid,
        name: get("subnetName") || `Subnet ${netuid}`,
        description: get("description"),
        githubRepo: get("githubRepo"),
        contact: get("subnetContact"),
        url: get("subnetUrl"),
        discord: get("discord"),
        additional: get("additional"),
        owner: owner ? owner.toString() : "",
        neurons: neurons ? Number(neurons.toString()) : 0,
        emission: emission ? raoToTknx(emission.toString()) : 0,
      };
    }),
  );
}

async function readNeurons(api: ApiPromise, netuid: number): Promise<Neuron[]> {
  const keysEntries = await api.query.subtensorModule.keys.entries(netuid);
  const total = keysEntries.length;
  if (total === 0) return [];

  const uids = keysEntries
    .map(([k, hotkey]) => ({
      uid: (k.args[1] as unknown as { toNumber: () => number }).toNumber(),
      hotkey: hotkey.toString(),
    }))
    .sort((a, b) => a.uid - b.uid);

  const limit = Math.min(uids.length, 256);

  return Promise.all(
    uids.slice(0, limit).map(async (n): Promise<Neuron> => {
      const [axonRaw, alphaRaw, coldkeyRaw, validatorPermitRaw, active, emission] =
        await Promise.all([
          api.query.subtensorModule.axons?.(netuid, n.hotkey).catch(() => null) ??
            Promise.resolve(null),
          api.query.subtensorModule.totalHotkeyAlpha?.(n.hotkey, netuid).catch(() => null) ??
            Promise.resolve(null),
          api.query.subtensorModule.owner?.(n.hotkey).catch(() => null) ??
            Promise.resolve(null),
          api.query.subtensorModule.validatorPermit?.(netuid).catch(() => null) ??
            Promise.resolve(null),
          api.query.subtensorModule.active?.(netuid).catch(() => null) ??
            Promise.resolve(null),
          api.query.subtensorModule.emission?.(netuid).catch(() => null) ??
            Promise.resolve(null),
        ]);

      const axon = axonRaw ? (axonRaw as unknown as { toJSON: () => Record<string, unknown> | null }).toJSON() : null;
      const ipNum = axon && typeof axon.ip === "number" ? axon.ip : 0;
      const port = axon && typeof axon.port === "number" ? axon.port : 0;
      const ipVersion = axon && typeof axon.ipType === "number" ? axon.ipType : 4;
      const protocol = axon && typeof axon.protocol === "number" ? axon.protocol : 0;
      const axonBlock = axon && typeof axon.block === "number" ? axon.block : 0;
      const axonVersion = axon && typeof axon.version === "number" ? axon.version : 0;

      const permitArr = validatorPermitRaw
        ? (validatorPermitRaw as unknown as { toJSON: () => unknown }).toJSON()
        : null;
      const activeArr = active
        ? (active as unknown as { toJSON: () => unknown }).toJSON()
        : null;
      const emissionArr = emission
        ? (emission as unknown as { toJSON: () => unknown }).toJSON()
        : null;

      const validatorPermit = Array.isArray(permitArr)
        ? Boolean(permitArr[n.uid])
        : false;
      const isActive = Array.isArray(activeArr)
        ? Boolean(activeArr[n.uid])
        : true;
      const neuronEmissionRao = Array.isArray(emissionArr)
        ? Number(emissionArr[n.uid] ?? 0)
        : 0;

      return {
        netuid,
        uid: n.uid,
        hotkey: n.hotkey,
        coldkey: coldkeyRaw ? coldkeyRaw.toString() : null,
        ip: ipFromU32(ipNum),
        port,
        ipVersion,
        protocol,
        axonBlock,
        axonVersion,
        alphaStake: alphaRaw ? raoToTknx(alphaRaw.toString()) : 0,
        active: isActive,
        validatorPermit,
        emission: raoToTknx(neuronEmissionRao),
      };
    }),
  );
}

async function readEscrows(api: ApiPromise): Promise<Escrow[]> {
  if (!api.query.konnexEscrow?.escrows?.entries) return [];
  const entries = await api.query.konnexEscrow.escrows.entries();
  const votesEntries = api.query.konnexEscrow.votes?.entries
    ? await api.query.konnexEscrow.votes.entries()
    : [];

  return entries.map(([key, val]): Escrow => {
    const args = key.args;
    const subnetId = (args[0] as unknown as { toNumber: () => number }).toNumber();
    const taskId = args[1].toString();
    const data = val.toJSON() as {
      payer?: string;
      payee?: string;
      amount?: number | string;
      descriptionHash?: string;
      deadline?: number;
      resolverCount?: number;
      status?: string;
    } | null;

    let approvals = 0;
    let rejections = 0;
    for (const [vk, vv] of votesEntries) {
      const vSubnet = (vk.args[0] as unknown as { toNumber: () => number }).toNumber();
      const vTask = vk.args[1].toString();
      if (vSubnet === subnetId && vTask === taskId) {
        const vj = (vv.toJSON() as unknown as string) ?? "";
        if (vj === "Approve") approvals++;
        else if (vj === "Reject") rejections++;
      }
    }

    return {
      subnetId,
      taskId,
      payer: (data?.payer as string) ?? "",
      payee: (data?.payee as string) ?? "",
      amount: data?.amount ? raoToTknx(data.amount.toString()) : 0,
      descriptionHash: (data?.descriptionHash as string) ?? "",
      deadline: Number(data?.deadline ?? 0),
      resolverCount: Number(data?.resolverCount ?? 0),
      approvals,
      rejections,
      status: (data?.status as Escrow["status"]) ?? "awaiting_release",
    };
  });
}

export async function getChainStats(): Promise<LiveResult<ChainStats>> {
  const fallback: ChainStats = {
    chain: "Konnex Testnet",
    nodeName: "Subtensor Node",
    version: "—",
    block: 0,
    finalizedHash: "—",
    peers: 0,
    isSyncing: false,
    totalSubnets: 0,
    totalIssuance: 0,
    totalStake: 0,
    totalNeurons: 0,
    totalEscrows: 0,
  };
  const r = await withApi(readChainStats, fallback);
  return { ...r, endpoint: RPC_ENDPOINT };
}

export async function getSubnets(): Promise<LiveResult<Subnet[]>> {
  const r = await withApi(readSubnets, [] as Subnet[]);
  return { ...r, endpoint: RPC_ENDPOINT };
}

export async function getSubnet(netuid: number): Promise<LiveResult<Subnet | null>> {
  const r = await withApi(async (api) => {
    const subnets = await readSubnets(api);
    return subnets.find((s) => s.netuid === netuid) ?? null;
  }, null);
  return { ...r, endpoint: RPC_ENDPOINT };
}

export async function getNeurons(netuid: number): Promise<LiveResult<Neuron[]>> {
  const r = await withApi(async (api) => readNeurons(api, netuid), [] as Neuron[]);
  return { ...r, endpoint: RPC_ENDPOINT };
}

export async function getNeuronByHotkey(
  hotkey: string,
): Promise<LiveResult<{ neuron: Neuron; subnet: Subnet } | null>> {
  const r = await withApi(async (api): Promise<{ neuron: Neuron; subnet: Subnet } | null> => {
    const subnets = await readSubnets(api);
    for (const subnet of subnets) {
      if (subnet.neurons === 0) continue;
      const neurons = await readNeurons(api, subnet.netuid);
      const found = neurons.find((n) => n.hotkey === hotkey);
      if (found) return { neuron: found, subnet };
    }
    return null;
  }, null);
  return { ...r, endpoint: RPC_ENDPOINT };
}

export async function getEscrows(): Promise<LiveResult<Escrow[]>> {
  const r = await withApi(readEscrows, [] as Escrow[]);
  return { ...r, endpoint: RPC_ENDPOINT };
}

export type Axon = {
  netuid: number;
  subnetName: string;
  uid: number;
  hotkey: string;
  ip: string;
  port: number;
  ipVersion: number;
  alphaStake: number;
  validatorPermit: boolean;
  active: boolean;
};

export async function getAllAxons(): Promise<LiveResult<Axon[]>> {
  const r = await withApi(async (api): Promise<Axon[]> => {
    const subnets = await readSubnets(api);
    const populated = subnets.filter((s) => s.neurons > 0);
    const axons: Axon[] = [];
    for (const subnet of populated) {
      const neurons = await readNeurons(api, subnet.netuid);
      for (const n of neurons) {
        if (!n.ip || n.port <= 0) continue;
        axons.push({
          netuid: subnet.netuid,
          subnetName: subnet.name,
          uid: n.uid,
          hotkey: n.hotkey,
          ip: n.ip,
          port: n.port,
          ipVersion: n.ipVersion,
          alphaStake: n.alphaStake,
          validatorPermit: n.validatorPermit,
          active: n.active,
        });
      }
    }
    return axons;
  }, [] as Axon[]);
  return { ...r, endpoint: RPC_ENDPOINT };
}
