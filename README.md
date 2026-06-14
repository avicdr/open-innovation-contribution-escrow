# OICE — Open Innovation Contribution Escrow

**Innovation isn't broken. Coordination is.**

OICE is a decentralized innovation coordination protocol. It scores every contribution with AI, holds funding in Ethereum escrow, and releases rewards only when milestones are verified — turning the full innovation lifecycle into a record that is verifiable, automated, and fair.

Every contribution gets a score. Every score has a reason. Every reward is earned.

---

## What it does

- **AI Contribution Evaluator** — Gemini scores each contribution across originality, effort, complexity, usefulness, and impact, and records the reasoning beside the on-chain proof trail.
- **Escrow & Rewards** — Sponsors deposit ETH into per-project escrow. After a checkpoint is approved, the reward pool is split by AI-weighted contribution scores.
- **Innovation DNA Graph** — A live, zoomable lifecycle map of projects, contributors, proofs, funding, milestones, outcomes, and rewards.
- **Innovation Hypercertificate** — A single shareable profile showing who contributed, how funding moved, what the AI observed, and whether the project is ready to ship.
- **AI Innovation Copilot** — Surfaces required roles, milestones, budget, risks, and missing-contributor recommendations.
- **Readiness Score** — A 0–100 view derived from team completeness, funding, contributions, checkpoints, documentation, and AI confidence.
- **90-second Simulation** — A guided, narrated demo that compresses the entire lifecycle into a single playable timeline.

---

## Architecture

OICE is layered so the UI never talks directly to the blockchain or the AI — everything flows through a service layer.

```
Frontend Layer (Next.js App Router, React 19, Tailwind)
        ↓
Application Layer (Route Handlers in src/app/api + services)
        ↓
Intelligence Layer (Google Gemini)
        ↓
Trust Layer (Ethereum / Base Sepolia + IPFS)
```

| Layer             | Type                    | Responsibility               |
| ----------------- | ----------------------- | ---------------------------- |
| Ethereum          | Deterministic           | Ownership, funds, proof      |
| MongoDB           | Deterministic           | Application state            |
| Gemini AI         | Non-deterministic       | Analysis, scoring, prediction|
| Simulation Engine | Deterministic (mock AI) | Demo flow                    |

The `InnovationEscrow.sol` contract (OpenZeppelin `AccessControl` + `ReentrancyGuard`) anchors innovations, contributions, proofs, milestones, bounties, funding, and reward distribution on-chain.

---

## Tech stack

- **Framework:** Next.js 15 (App Router) · React 19 · TypeScript
- **Styling:** Tailwind CSS · Framer Motion · Lucide icons
- **Data & graph:** React Flow · Recharts · TanStack Query · React Hook Form · Zod
- **Database:** MongoDB
- **AI:** Google Gemini (`@google/generative-ai`)
- **Blockchain:** Solidity · Hardhat · wagmi · viem — deployed to Base Sepolia
- **Storage:** IPFS via Pinata
- **Testing:** Vitest · Hardhat

---

## Project structure

```
src/
  app/            # App Router pages + API route handlers
    api/          # ai, auth, bounty, contribution, events, funding,
                  # hypercertificate, innovation, milestone, rewards, storage
    dashboard/    contributor/  innovation/  hypercertificate/
    bounties/     my-projects/  simulation/
  components/     # Shared UI primitives (Button, Card, …)
  features/       # Feature modules: auth, bounty, contribution,
                  # dna-graph, funding, innovation, simulation
  services/       # Service layer: ai, blockchain, database, github,
                  # contract-events, hypercertificate, reward, storage, …
  domain/  lib/   # Domain models and shared utilities
contracts/        # InnovationEscrow.sol
scripts/          # apply-indexes.ts, seed-demo.ts
```

---

## Getting started

### Prerequisites

- Node.js `>= 22`
- A MongoDB instance (Atlas or local)
- A Google Gemini API key
- (Optional, for on-chain features) Base Sepolia RPC URL + funded wallet, and a Pinata JWT

### Install

```bash
npm install
```

### Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `MONGODB_URI` / `MONGODB_DB` | MongoDB connection string and database name |
| `GEMINI_API_KEY` | Google Gemini API key |
| `PINATA_JWT` | Pinata JWT for IPFS uploads |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID |
| `NEXT_PUBLIC_CHAIN_ID` | Target chain ID (`84532` = Base Sepolia) |
| `BASE_SEPOLIA_RPC_URL` | RPC endpoint for Base Sepolia |
| `CONTRACT_PRIVATE_KEY` | Deployer / signer private key |
| `NEXT_PUBLIC_INNOVATION_ESCROW_ADDRESS` | Deployed escrow contract address |
| `NEXT_PUBLIC_DEMO_FUNDING` | `true` to simulate deposits without a wallet/contract (UI demos) |

> The app runs without on-chain config when `NEXT_PUBLIC_DEMO_FUNDING=true`, which is handy for UI demos and the simulation.

### Prepare the database (optional)

```bash
npm run db:indexes   # apply MongoDB indexes
npm run db:seed      # seed demo data
```

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Build, then serve the production app |
| `npm run lint` | Run ESLint (`next lint`) |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run test` | Run the Vitest suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run db:indexes` | Apply MongoDB indexes |
| `npm run db:seed` | Seed demo data |
| `npm run contracts:compile` | Compile contracts with Hardhat |
| `npm run contracts:test` | Run contract tests |

---

## Smart contracts

The `InnovationEscrow` contract uses role-based access control:

- `PROJECT_OWNER_ROLE`, `VALIDATOR_ROLE`, `SPONSOR_ROLE`
- `CONTRIBUTOR_ROLE`, `SCORE_MANAGER_ROLE`, `MILESTONE_APPROVER_ROLE`

```bash
npm run contracts:compile
npm run contracts:test
```

Configuration lives in `hardhat.config.ts`. The target network is **Base Sepolia** (chain ID `84532`).

---

## Lifecycle at a glance

1. **Create** an innovation (title, description, tags, IPFS metadata, creator wallet)
2. **Contribute** code, research, design, docs, testing, or community work
3. **AI evaluates** each contribution and records its reasoning
4. **Validate** checkpoints against an auditable proof trail
5. **Fund** the project — sponsors deposit ETH into escrow
6. **Hit milestones** to unlock the next funding decision
7. **Distribute rewards** split by AI-weighted contribution scores
8. **Generate a hypercertificate** capturing the full lifecycle

---

## License

MIT — see the SPDX headers in `contracts/`.
