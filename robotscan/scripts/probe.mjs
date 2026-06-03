// Deep probe: focus on KonnexEscrow + real Subtensor data counts
import { ApiPromise, WsProvider } from "@polkadot/api";

const ENDPOINT = "wss://testnet-rpc1.konnex.world:39944";

function bold(s) { return `\n\x1b[1m${s}\x1b[0m`; }

async function main() {
  const provider = new WsProvider(ENDPOINT, 5000);
  const api = await ApiPromise.create({ provider, throwOnConnect: true });

  // === KonnexEscrow detailed dump ===
  const meta = api.runtimeMetadata.asLatest;
  const pallets = meta.pallets.toArray();
  const escrow = pallets.find((p) => p.name.toString() === "KonnexEscrow");
  if (escrow) {
    console.log(bold("== KonnexEscrow (custom Konnex pallet) =="));
    if (escrow.calls.isSome) {
      const t = api.registry.lookup.getSiType(escrow.calls.unwrap().type);
      console.log("  calls:");
      for (const v of t.def.asVariant.variants) {
        const args = v.fields.map((f) => {
          const name = f.name.isSome ? f.name.unwrap().toString() : "_";
          const typeName = api.registry.lookup.getName(f.type) ?? f.type.toString();
          return `${name}: ${typeName}`;
        });
        console.log(`    - ${v.name.toString()}(${args.join(", ")})`);
        if (v.docs.length) {
          for (const d of v.docs) console.log(`        /// ${d.toString()}`);
        }
      }
    }
    if (escrow.events.isSome) {
      const t = api.registry.lookup.getSiType(escrow.events.unwrap().type);
      console.log("  events:");
      for (const v of t.def.asVariant.variants) {
        const args = v.fields.map((f) => {
          const name = f.name.isSome ? f.name.unwrap().toString() : "_";
          const typeName = api.registry.lookup.getName(f.type) ?? f.type.toString();
          return `${name}: ${typeName}`;
        });
        console.log(`    - ${v.name.toString()}(${args.join(", ")})`);
      }
    }
    if (escrow.storage.isSome) {
      const s = escrow.storage.unwrap();
      console.log("  storage:");
      for (const item of s.items) {
        const docs = item.docs.map((d) => d.toString()).join(" ");
        console.log(`    - ${item.name.toString()}  ${docs ? "// " + docs : ""}`);
      }
    }
  }

  // === Real counts and identities ===
  console.log(bold("== Live Subtensor counts =="));

  const totalNetworks = await api.query.subtensorModule.totalNetworks();
  console.log("total subnets (netuid):", totalNetworks.toString());

  const totalStake = await api.query.subtensorModule.totalStake();
  const totalIssuance = await api.query.balances.totalIssuance();
  const decimals = 9;
  function fmt(big) {
    const s = BigInt(big.toString());
    const whole = s / BigInt(10 ** decimals);
    const frac = s % BigInt(10 ** decimals);
    return `${whole.toString()}.${frac.toString().padStart(9, "0").slice(0, 3)} tKNX`;
  }
  console.log("total stake:", fmt(totalStake.toString()));
  console.log("total issuance:", fmt(totalIssuance.toString()));

  // Get the list of subnets that exist
  const networksAddedEntries = await api.query.subtensorModule.networksAdded.entries();
  const existingNetuids = networksAddedEntries
    .filter(([_, val]) => val.toJSON() === true)
    .map(([key]) => key.args[0].toNumber())
    .sort((a, b) => a - b);
  console.log(`active netuids (${existingNetuids.length}):`, existingNetuids.slice(0, 30));

  // Subnet identities (if set)
  console.log(bold("== Subnet identities (if any) =="));
  for (const netuid of existingNetuids.slice(0, 10)) {
    try {
      const idQ = api.query.subtensorModule.subnetIdentitiesV3
        ?? api.query.subtensorModule.subnetIdentities
        ?? api.query.subtensorModule.subnetIdentitiesV2;
      if (!idQ) {
        console.log("  (no subnetIdentities storage)");
        break;
      }
      const id = await idQ(netuid);
      const json = id.toJSON();
      const symbol = await (api.query.subtensorModule.tokenSymbol
        ? api.query.subtensorModule.tokenSymbol(netuid)
        : Promise.resolve(null));
      const subnetName = await (api.query.subtensorModule.subnetName
        ? api.query.subtensorModule.subnetName(netuid)
        : Promise.resolve(null));
      const owner = await (api.query.subtensorModule.subnetOwner
        ? api.query.subtensorModule.subnetOwner(netuid)
        : Promise.resolve(null));
      const neurons = await api.query.subtensorModule.subnetworkN(netuid);
      console.log(`  netuid=${netuid}  neurons=${neurons.toString()}`);
      if (subnetName) {
        try {
          const bytes = subnetName.toU8a ? subnetName.toU8a() : null;
          const decoded = bytes ? new TextDecoder().decode(bytes) : subnetName.toString();
          console.log(`     subnetName: ${decoded}`);
        } catch {}
      }
      if (owner) console.log(`     owner: ${owner.toString()}`);
      if (json && Object.keys(json).length) {
        console.log("     identity:", JSON.stringify(json));
      }
    } catch (e) {
      console.log(`  netuid=${netuid}  ERR ${e?.message ?? e}`);
    }
  }

  // Neurons in netuid 1 (sample)
  if (existingNetuids.length > 0) {
    const sampleNet = existingNetuids[Math.min(1, existingNetuids.length - 1)];
    console.log(bold(`== Neurons in netuid=${sampleNet} (first 5) ==`));
    const uidsKeys = await api.query.subtensorModule.keys.entries(sampleNet);
    console.log(`  total hotkeys registered: ${uidsKeys.length}`);
    for (const [k, hotkey] of uidsKeys.slice(0, 5)) {
      const uid = k.args[1].toNumber();
      const hk = hotkey.toString();
      try {
        const stakeAtUid = await (api.query.subtensorModule.totalHotkeyAlpha
          ? api.query.subtensorModule.totalHotkeyAlpha(hk, sampleNet)
          : Promise.resolve(null));
        const ipinfo = await (api.query.subtensorModule.axons
          ? api.query.subtensorModule.axons(sampleNet, hk)
          : Promise.resolve(null));
        const lastUpdate = await (api.query.subtensorModule.lastUpdate
          ? api.query.subtensorModule.lastUpdate(sampleNet)
          : Promise.resolve(null));
        console.log(
          `  uid=${uid}  hotkey=${hk.slice(0, 12)}...  alpha=${stakeAtUid?.toString() ?? "?"}  axon=${ipinfo ? JSON.stringify(ipinfo.toJSON()) : "?"}`,
        );
      } catch (e) {
        console.log(`  uid=${uid}  hotkey=${hk.slice(0, 12)}...  ERR ${e?.message ?? e}`);
      }
    }

    // Identities of neurons (if set)
    const ids = await (api.query.subtensorModule.identities
      ? api.query.subtensorModule.identities.entries()
      : Promise.resolve([]));
    console.log(`\n  identities registered: ${ids.length}`);
    for (const [k, v] of ids.slice(0, 5)) {
      const account = k.args[0].toString();
      const json = v.toJSON();
      console.log(`    ${account.slice(0, 12)}...  ${JSON.stringify(json)}`);
    }
  }

  // Try to find KonnexEscrow storage entries
  if (escrow) {
    console.log(bold("== KonnexEscrow live entries =="));
    for (const item of escrow.storage.unwrap().items) {
      try {
        const q = api.query.konnexEscrow[item.name.toString().charAt(0).toLowerCase() + item.name.toString().slice(1)]
          ?? api.query.konnexEscrow[item.name.toString()];
        if (!q) {
          console.log(`  ${item.name.toString()}  (no decorated query)`);
          continue;
        }
        const isMap = item.type.isMap || item.type.isDoubleMap;
        if (q.entries) {
          const ents = await q.entries();
          console.log(`  ${item.name.toString()}  entries=${ents.length}`);
          for (const [k, v] of ents.slice(0, 3)) {
            console.log(`    key=${k.args.map((a) => a.toString().slice(0, 20)).join("|")} val=${JSON.stringify(v.toJSON()).slice(0, 200)}`);
          }
        } else {
          const val = await q();
          console.log(`  ${item.name.toString()}  value=${JSON.stringify(val.toJSON()).slice(0, 200)}`);
        }
      } catch (e) {
        console.log(`  ${item.name.toString()}  ERR ${e?.message ?? e}`);
      }
    }
  }

  await api.disconnect();
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });
