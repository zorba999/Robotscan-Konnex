# Robotscan

> The public ledger of verified physical work on Konnex. Search every subnet, neuron, validator, and PoPW escrow, with the world map of where the machines actually run.

**Live: [robotscan-konnex.vercel.app](https://robotscan-konnex.vercel.app)**

Robotscan is an open, robot-centric explorer for the [Konnex](https://docs.konnex.world) network. The default block explorer surfaces blocks and extrinsics. Robotscan surfaces what a Konnex user actually needs to reason about: subnets, neurons (miners and validators), their on-chain identity, their axon endpoints, and PoPW escrows.

Submitted under the [Konnex Subnet Builder Program](https://subnets.testnet.konnex.world/builders).

## What you can do here

- **Search any subnet, neuron, or validator** from the global search bar.
- **Browse every workload class** on `/subnets`: name, description, GitHub, neuron count.
- **Inspect a subnet** on `/subnet/[netuid]`: validators, miners, axon endpoints, α stake, role.
- **Look up a neuron** on `/robot/[hotkey]`: identity, stake, endpoint, subnet context.
- **See the physical fleet** on `/map`: every axon geolocated on a world map, grouped by country, city, and hosting provider.
- **Track PoPW work** on `/escrows`: the `KonnexEscrow` table renders the moment a payer locks tKNX.

Every page is live: data is read directly from the Konnex testnet RPC and re-validated automatically.

## On chain today

A snapshot from a recent render. Numbers refresh on every page load.

| Signal | Value |
|---|---|
| Active subnets | 31 |
| Registered neurons | 326 |
| Total α stake | ~343,700 tKNX |
| Total issuance | ~692M tKNX |
| Neurons geolocated on the map | 134 |
| Distinct countries on the map | 18 |

## Stack

- **Next.js 16** with the App Router, React 19, TypeScript.
- **Tailwind CSS v4** and **shadcn/ui** for the design system.
- **@polkadot/api** for live reads against the Konnex testnet (Substrate, Subtensor fork).
- **react-leaflet** with the CartoDB Dark Matter basemap for the world map.
- **ip-api.com** batch endpoint for IPv4 geolocation, with an in-memory cache.

## Routes

| Path | Purpose |
|---|---|
| `/` | live chain stats and populated subnets at a glance |
| `/subnets` | every workload class registered on Konnex |
| `/subnet/[netuid]` | per-subnet view: neurons, roles, axons, stake |
| `/robot/[hotkey]` | per-neuron lookup across all subnets |
| `/map` | world map of advertised axon endpoints |
| `/escrows` | `KonnexEscrow` activity feed |
| `/api/search` | live search across subnets and hotkeys |

## Project layout

```
.
├── robotscan/              Next.js app
│   ├── app/                routes
│   ├── components/         UI and domain components
│   ├── lib/konnex/         chain client, queries, decode helpers, geolocation
│   └── scripts/            chain reconnaissance and integration probes
└── README.md
```

## Development

Prerequisites: Node.js 20.17 or newer.

| Command | Purpose |
|---|---|
| `npm install` | install dependencies |
| `npm run dev` | start the development server |
| `npm run build` | build for production |
| `npm run lint` | run ESLint |

All commands run from inside `robotscan/`. The RPC endpoint defaults to `wss://testnet-rpc1.konnex.world:39944` and can be overridden with `KONNEX_RPC_URL`.

## Roadmap

**Now.** Live reads against the Konnex testnet, world map of axon endpoints, debounced search across subnets and hotkeys, `KonnexEscrow` table ready for the first funded task.

**Next.** A Subsquid indexer subscribing to chain events for historical PoPW queries, a public GraphQL API for partner integrations, IPFS previews for PoPW bundles.

**Later.** Validator-weights network graph, embeddable widgets for subnet owners, reputation scoring as a service for insurers and B2B partners.

## Acknowledgments

Built on the public [Konnex testnet](https://subnets.testnet.konnex.world). Community-built, not affiliated with Konnex Inc.

If you are a subnet owner and want your subnet identity to render correctly here, make sure the `subnetName`, `description`, `githubRepo`, and `subnetUrl` fields are set on chain.
