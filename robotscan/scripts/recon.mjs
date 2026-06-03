// Recon script: connects to Konnex testnet and dumps a high-level summary
// of pallets, events, extrinsics, storage items, and a few key counters.
//
// Run with:  node scripts/recon.mjs

import { ApiPromise, WsProvider, HttpProvider } from "@polkadot/api";

const ENDPOINTS = [
  "wss://testnet-rpc1.konnex.world:39944",
  "https://testnet-rpc1.konnex.world:39944",
];

async function connect() {
  for (const ep of ENDPOINTS) {
    try {
      const provider = ep.startsWith("ws")
        ? new WsProvider(ep, 5000)
        : new HttpProvider(ep);
      const api = await ApiPromise.create({ provider, throwOnConnect: true });
      console.log("Connected via:", ep);
      return api;
    } catch (e) {
      console.warn("Failed", ep, e?.message ?? e);
    }
  }
  throw new Error("Could not connect to any endpoint");
}

function bold(s) {
  return `\n\x1b[1m${s}\x1b[0m`;
}

async function main() {
  const api = await connect();

  const [chain, name, version, props, health, head, finalized] =
    await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version(),
      api.rpc.system.properties(),
      api.rpc.system.health(),
      api.rpc.chain.getHeader(),
      api.rpc.chain.getFinalizedHead(),
    ]);

  console.log(bold("== Chain =="));
  console.log("chain:        ", chain.toString());
  console.log("node:         ", name.toString());
  console.log("version:      ", version.toString());
  console.log("token:        ", props.tokenSymbol.toString(), "decimals", props.tokenDecimals.toString());
  console.log("ss58:         ", props.ss58Format.toString());
  console.log("peers:        ", health.peers.toString());
  console.log("syncing:      ", health.isSyncing.toString());
  console.log("head:         ", head.number.toNumber());
  console.log("finalized:    ", finalized.toHex());

  const meta = api.runtimeMetadata.asLatest;
  const pallets = meta.pallets.toArray();

  console.log(bold("== Pallets =="));
  for (const p of pallets) {
    const calls = p.calls.isSome
      ? api.registry.lookup.getSiType(p.calls.unwrap().type).def.asVariant
          .variants.length
      : 0;
    const events = p.events.isSome
      ? api.registry.lookup.getSiType(p.events.unwrap().type).def.asVariant
          .variants.length
      : 0;
    const storage = p.storage.isSome ? p.storage.unwrap().items.length : 0;
    console.log(
      `  ${p.name.toString().padEnd(28)} calls=${String(calls).padStart(3)}  events=${String(events).padStart(3)}  storage=${String(storage).padStart(3)}`,
    );
  }

  const interesting = pallets.filter((p) =>
    /robot|task|popw|subnet|miner|validator|reward|stake|workload/i.test(
      p.name.toString(),
    ),
  );

  if (interesting.length === 0) {
    console.log(
      "\nNo pallet names match robot/task/PoPW/subnet/miner/validator/reward/stake/workload.",
    );
  }

  for (const p of interesting.length ? interesting : pallets) {
    const pname = p.name.toString();
    if (!interesting.length && !["System", "Balances", "SubtensorModule"].includes(pname)) continue;

    console.log(bold(`== ${pname} ==`));

    if (p.calls.isSome) {
      const t = api.registry.lookup.getSiType(p.calls.unwrap().type);
      console.log("  calls:");
      for (const v of t.def.asVariant.variants.slice(0, 40)) {
        const args = v.fields.map(
          (f) =>
            `${f.name.isSome ? f.name.unwrap().toString() : "_"}: ${api.registry.lookup.getName(f.type) ?? f.type.toString()}`,
        );
        console.log(`    - ${v.name.toString()}(${args.join(", ")})`);
      }
    }

    if (p.events.isSome) {
      const t = api.registry.lookup.getSiType(p.events.unwrap().type);
      console.log("  events:");
      for (const v of t.def.asVariant.variants.slice(0, 40)) {
        console.log(`    - ${v.name.toString()}`);
      }
    }

    if (p.storage.isSome) {
      console.log("  storage:");
      for (const item of p.storage.unwrap().items.slice(0, 40)) {
        console.log(`    - ${item.name.toString()}`);
      }
    }
  }

  // Try a few well-known Subtensor storage queries
  console.log(bold("== Subtensor probes =="));
  const probes = [
    "subtensorModule.totalNetworks",
    "subtensorModule.totalIssuance",
    "subtensorModule.totalStake",
    "subtensorModule.networksAdded",
    "subtensorModule.subnetworkN",
  ];
  for (const path of probes) {
    try {
      const [m, k] = path.split(".");
      const q = api.query?.[m]?.[k];
      if (!q) {
        console.log(`  ${path.padEnd(36)}  (missing)`);
        continue;
      }
      const val = await q();
      const s = val.toString();
      console.log(
        `  ${path.padEnd(36)}  ${s.length > 80 ? s.slice(0, 80) + "…" : s}`,
      );
    } catch (e) {
      console.log(`  ${path.padEnd(36)}  ERR ${e?.message ?? e}`);
    }
  }

  await api.disconnect();
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
