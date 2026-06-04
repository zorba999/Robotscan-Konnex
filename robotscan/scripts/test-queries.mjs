// Test the real queries from lib/konnex/queries.ts using @polkadot/api directly.
// (Pure ESM file mirroring the production logic to validate it before the UI hits it.)

import { ApiPromise, WsProvider } from "@polkadot/api";

const ENDPOINT = "wss://testnet-rpc1.konnex.world:39944";

function hexToUtf8(hex) {
  if (!hex || typeof hex !== "string") return "";
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (!clean.length) return "";
  const bytes = [];
  for (let i = 0; i < clean.length; i += 2) bytes.push(parseInt(clean.slice(i, i + 2), 16));
  return new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes));
}
function ipFromU32(n) {
  if (!Number.isFinite(Number(n)) || Number(n) <= 0) return "";
  const num = Number(n);
  return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff].join(".");
}
function raoToTknx(rao) {
  const big = BigInt(String(rao));
  return Number(big) / 1e9;
}

async function main() {
  const api = await ApiPromise.create({ provider: new WsProvider(ENDPOINT, 5000), noInitWarn: true });

  console.log("\n== Subnets w/ decoded identities ==");
  const networksAdded = await api.query.subtensorModule.networksAdded.entries();
  const netuids = networksAdded
    .filter(([, v]) => v.toJSON() === true)
    .map(([k]) => k.args[0].toNumber())
    .sort((a, b) => a - b);

  for (const netuid of netuids.slice(0, 12)) {
    const [neurons, owner, idRaw] = await Promise.all([
      api.query.subtensorModule.subnetworkN(netuid),
      api.query.subtensorModule.subnetOwner(netuid),
      api.query.subtensorModule.subnetIdentitiesV3
        ? api.query.subtensorModule.subnetIdentitiesV3(netuid)
        : null,
    ]);
    const id = idRaw ? idRaw.toJSON() : null;
    const name = id ? hexToUtf8(id.subnetName) : `Subnet ${netuid}`;
    const desc = id ? hexToUtf8(id.description) : "";
    console.log(`  netuid=${String(netuid).padStart(2)}  neurons=${String(neurons.toString()).padStart(3)}  name="${name}"`);
    if (desc) console.log(`     desc: ${desc.slice(0, 80)}`);
  }

  console.log("\n== Sample neurons w/ decoded IP ==");
  const sampleNet = 4; // drone-navigation, 134 neurons
  const keysEntries = await api.query.subtensorModule.keys.entries(sampleNet);
  console.log(`  netuid=${sampleNet} has ${keysEntries.length} neurons`);
  const sorted = keysEntries
    .map(([k, hk]) => ({ uid: k.args[1].toNumber(), hotkey: hk.toString() }))
    .sort((a, b) => a.uid - b.uid)
    .slice(0, 6);
  for (const n of sorted) {
    const [axonRaw, alphaRaw, coldkeyRaw] = await Promise.all([
      api.query.subtensorModule.axons(sampleNet, n.hotkey),
      api.query.subtensorModule.totalHotkeyAlpha(n.hotkey, sampleNet),
      api.query.subtensorModule.owner(n.hotkey),
    ]);
    const axon = axonRaw.toJSON();
    const ip = axon ? ipFromU32(axon.ip) : "-";
    const port = axon ? axon.port : 0;
    const alpha = alphaRaw ? raoToTknx(alphaRaw.toString()) : 0;
    console.log(
      `  uid=${String(n.uid).padStart(3)}  hotkey=${n.hotkey.slice(0, 8)}…  alpha=${alpha.toFixed(4)} tKNX  ip=${ip}:${port}  coldkey=${coldkeyRaw.toString().slice(0, 8)}…`,
    );
  }

  await api.disconnect();
  console.log("\nOK");
}

main().catch((e) => { console.error("FAIL", e); process.exit(1); });
