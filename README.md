# Robotscan — Konnex Explorer

> The public ledger of verified physical work on Konnex. Search every subnet, neuron, validator, and PoPW escrow — with the world map of where the machines actually run.

This is a community-built block explorer focused on **robot-centric views** for the [Konnex](https://docs.konnex.world) network. The default Konnex explorer surfaces blocks and transactions; Robotscan surfaces **robots, missions, validators, and PoPW bundles** — the way operators, insurers, and regulators actually need to reason about a physical-AI fleet.

Submitted under the [Konnex Subnet Builder Program](https://subnets.testnet.konnex.world/builders) — sensor fusion & PoPW validation track.

## What it does

- 🤖 **Robot pages** — identity, TEE attestation, mission timeline, trust score (Bronze → Diamond), total earned
- 🛰️ **Mission pages** — instruction, GPS trajectory, sensor traces (speed/accel/gyro/temp/battery), validator scores
- 🌐 **Subnet leaderboards** — robots ranked by trust score, recent missions, active validators
- 🛡️ **Validator pages** — stakes, missions validated, agreement rate vs. consensus
- 🔍 **Live search** — robot name, mission ID, validator with keyboard navigation
- 🌓 Dark mode, mobile responsive

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (zinc theme)
- **Recharts** for sensor charts, custom SVG for trajectory plots
- **@faker-js/faker** for deterministic mock data (Phase 1)

## Roadmap

### Phase 1 — MVP with mock data ✅
Full UI shipped with deterministic seeded data so the user flow can be reviewed end-to-end without testnet dependency.

### Phase 2 — Real Konnex data
- Subsquid indexer subscribing to Konnex Substrate L1 events
- Replace mock layer with live GraphQL queries
- IPFS gateway for PoPW bundle previews

### Phase 3 — Public APIs & B2B
- GraphQL API for partner integrations
- TrustScore-as-a-service for insurance and B2B
- Mapbox real-map trajectories

## Local development

```bash
cd robotscan
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

```
.
├── robotscan/        # Next.js frontend
│   ├── app/          # routes (/, /robot, /mission, /subnet, /validator)
│   ├── components/   # UI + domain components
│   └── lib/          # types, mock data, format helpers
└── .claude/          # Claude Code config (launch.json)
```
