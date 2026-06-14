# OICE_SYSTEM_ARCHITECTURE.md

# Open Innovation Contribution Escrow (OICE)

## System Architecture Document

Version: 1.0

---

# 1. SYSTEM OVERVIEW

OICE is a multi-layered decentralized AI + blockchain application designed to coordinate innovation lifecycle management.

It consists of four core layers:

```txt id="arch0"
Frontend Layer (Next.js)
        ↓
Application Layer (API + Services)
        ↓
Intelligence Layer (Gemini AI)
        ↓
Trust Layer (Ethereum + IPFS)
```

---

# 2. CORE DESIGN PRINCIPLES

## 2.1 Separation of Concerns

- UI never talks directly to blockchain or AI
- All external systems are accessed through service layer

---

## 2.2 Deterministic + Non-Deterministic Split

| Layer             | Type                    | Responsibility          |
| ----------------- | ----------------------- | ----------------------- |
| Ethereum          | Deterministic           | Ownership, funds, proof |
| Database          | Deterministic           | App state               |
| Gemini AI         | Non-deterministic       | Analysis, prediction    |
| Simulation Engine | Deterministic (mock AI) | Demo flow               |

---

## 2.3 Event-Driven Architecture

All major actions emit events:

- InnovationCreated
- ContributionSubmitted
- AIScored
- FundsDeposited
- MilestoneApproved
- RewardsDistributed

---

# 3. HIGH LEVEL ARCHITECTURE

```txt id="arch1"
                ┌────────────────────┐
                │     Frontend       │
                │  Next.js (UI/UX)   │
                └────────┬───────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ API Layer     │ │ Simulation  │ │ Auth Layer   │
│ (Routes)      │ │ Engine      │ │ Wallet/Auth  │
└───────┬───────┘ └──────┬──────┘ └──────┬──────┘
        │                │                │
        └───────┬────────┴───────┬────────┘
                │                │
     ┌──────────▼──────┐ ┌──────▼────────┐
     │ Service Layer    │ │ AI Layer      │
     │                  │ │ Gemini API    │
     └──────────┬──────┘ └──────┬────────┘
                │                │
     ┌──────────▼────────────────▼──────────┐
     │     Blockchain + Storage Layer       │
     │ Ethereum (Base Sepolia) + IPFS      │
     └──────────────────────────────────────┘
```

---

# 4. FRONTEND ARCHITECTURE

## 4.1 Framework

- Next.js 15 App Router
- React Server Components (RSC where possible)
- Client components for interactive systems

---

## 4.2 Folder Structure

```txt id="arch2"
app/
 ├ page.tsx (Landing)
 ├ dashboard/
 ├ innovation/
 ├ passport/
 ├ simulation/
 ├ explore/
 ├ api/

components/
 ├ ui/
 ├ layout/
 ├ charts/
 ├ simulation/
 ├ blockchain/
 ├ ai/
 ├ graphs/

features/
 ├ innovation/
 ├ contribution/
 ├ ai-copilot/
 ├ dna-graph/
 ├ passport/
 ├ simulation/
 ├ funding/

services/
 ├ api/
 ├ gemini/
 ├ blockchain/
 ├ ipfs/

lib/
 ├ utils/
 ├ constants/
 ├ config/
```

---

# 5. APPLICATION LAYER

## 5.1 API Responsibilities

All backend logic is centralized:

- Validate requests
- Call AI
- Call blockchain
- Persist DB state
- Trigger simulation updates

---

## 5.2 API Structure

```txt id="arch3"
POST /api/innovation/create
POST /api/contribution/create
POST /api/ai/analyze
POST /api/ai/copilot
POST /api/ai/missing-contributors
POST /api/funding/deposit
POST /api/milestone/approve
POST /api/rewards/distribute
GET  /api/passport/:id
```

---

# 6. AI LAYER (GEMINI)

## 6.1 AI Service Gateway

Single abstraction:

```ts id="arch4"
GeminiService {
  analyzeContribution()
  generateInnovationPlan()
  findMissingContributors()
  predictTimeline()
  calculateReadiness()
}
```

---

## 6.2 AI Flow

```txt id="arch5"
User Action
   ↓
API Route
   ↓
Gemini Service
   ↓
Prompt Engineering Layer
   ↓
Structured JSON Output
   ↓
Database Storage
   ↓
UI Rendering
```

---

## 6.3 AI Output Contract

All AI responses MUST follow strict schema:

```json id="arch6"
{
  "success": true,
  "data": {},
  "reasoning": ""
}
```

---

# 7. BLOCKCHAIN ARCHITECTURE

## 7.1 Network

- Base Sepolia (recommended for hackathon)

---

## 7.2 Smart Contract System

### InnovationEscrow.sol

Handles:

- Innovation registration
- Contribution registration
- Fund deposits
- Milestones
- Reward distribution

---

## 7.3 Contract Architecture

```txt id="arch7"
Frontend
   ↓
Wagmi/Viem
   ↓
Smart Contracts
   ↓
Base Sepolia
   ↓
Events emitted
   ↓
Backend indexer
```

---

## 7.4 Contract Events

```solidity id="arch8"
event InnovationCreated(uint256 id);
event ContributionAdded(uint256 id);
event FundsDeposited(uint256 amount);
event MilestoneApproved(uint256 id);
event RewardsDistributed(address user, uint256 amount);
```

---

# 8. DATABASE ARCHITECTURE

## 8.1 PostgreSQL Schema

Core tables:

- users
- innovations
- contributions
- validations
- funding
- milestones
- rewards
- passports
- simulations

---

## 8.2 Data Flow

```txt id="arch9"
Blockchain Event
      ↓
Indexer Service
      ↓
Database Update
      ↓
Frontend Query
```

---

# 9. SIMULATION ENGINE (CRITICAL SYSTEM)

## 9.1 Purpose

Simulates entire platform lifecycle for demo purposes.

---

## 9.2 Architecture

```txt id="arch10"
Simulation Controller
        ↓
State Machine
        ↓
Step Renderer
        ↓
UI Animation Layer
        ↓
Event Timeline
```

---

## 9.3 Simulation State Machine

```ts id="arch11"
enum SimulationStep {
  INIT,
  CREATE_INNOVATION,
  COPILOT_ANALYSIS,
  CONTRIBUTORS_JOIN,
  CONTRIBUTIONS,
  AI_EVALUATION,
  VALIDATION,
  FUNDING,
  MILESTONE_APPROVAL,
  REWARD_DISTRIBUTION,
  PASSPORT_GENERATION,
  DNA_GRAPH_EXPANSION,
  COMPLETE,
}
```

---

## 9.4 Simulation Data Source

Simulation uses:

- Mock DB entries
- Predefined AI responses
- Pre-generated contributors
- Precomputed funding flows

NO real blockchain calls during simulation.

---

## 9.5 Simulation UI Flow

```txt id="arch12"
User clicks "Run Simulation"
        ↓
Overlay activated
        ↓
Auto-play timeline starts
        ↓
Each step triggers:
    - UI animation
    - Graph update
    - Data injection
        ↓
Final summary screen
```

---

## 9.6 Simulation Components

```txt id="arch13"
SimulationEngine.tsx
SimulationTimeline.tsx
SimulationOverlay.tsx
SimulationStepRenderer.tsx
SimulationControls.tsx
SimulationProgress.tsx
```

---

# 10. INNOVATION DNA GRAPH ARCHITECTURE

## 10.1 Engine

React Flow based DAG system.

---

## 10.2 Node Types

- Innovation Node
- Contribution Node
- Funding Node
- Milestone Node
- Reward Node

---

## 10.3 Graph Flow

```txt id="arch14"
Innovation
  ├── Contribution A
  ├── Contribution B
  ├── Funding Event
  └── Milestone
```

---

## 10.4 Real-Time Updates

Graph updates on:

- Contribution submission
- AI scoring
- Funding events
- Simulation events

---

# 11. INNOVATION PASSPORT ARCHITECTURE

## 11.1 Concept

A unified profile view of innovation lifecycle.

---

## 11.2 Data Aggregation

Passport pulls from:

- Database
- Blockchain
- AI outputs
- Simulation logs

---

## 11.3 Rendering Pipeline

```txt id="arch15"
API Aggregation Layer
        ↓
Normalized Passport Object
        ↓
UI Renderer
        ↓
Sections:
  - Overview
  - Contributors
  - Funding
  - Rewards
  - Graph
  - AI Insights
```

---

# 12. FUNDING FLOW ARCHITECTURE

```txt id="arch16"
Sponsor Wallet
      ↓
Smart Contract Escrow
      ↓
Milestone Approval
      ↓
Release Funds
      ↓
Reward Distribution Engine
      ↓
Contributor Wallets
```

---

# 13. SECURITY MODEL

## 13.1 Smart Contract Security

- OpenZeppelin
- ReentrancyGuard
- Ownable
- AccessControl

---

## 13.2 API Security

- Wallet authentication
- Rate limiting
- Input validation (Zod)

---

## 13.3 Data Integrity

- IPFS hash verification
- Blockchain event verification

---

# 14. PERFORMANCE STRATEGY

## Frontend

- React Server Components
- Lazy loading graphs
- Memoized simulation steps

---

## Backend

- Cached AI responses
- Batch DB writes
- Event indexing

---

## Blockchain

- Minimal on-chain writes
- Batch contributions where possible

---

# 15. DEPLOYMENT ARCHITECTURE

```txt id="arch17"
Frontend → Vercel
Database → Neon PostgreSQL
Storage → Pinata IPFS
Blockchain → Base Sepolia
```

---

# 16. CRITICAL SYSTEM INTERACTIONS

## 16.1 Contribution Flow

```txt id="arch18"
UI → API → DB → AI → DB → UI
                 ↓
             Blockchain (optional)
```

---

## 16.2 Simulation Flow

```txt id="arch19"
UI → Simulation Engine → Mock Services → UI Animations
```

---

## 16.3 Funding Flow

```txt id="arch20"
UI → Smart Contract → Event → Indexer → DB → UI
```

---

# 17. KEY DESIGN INSIGHT

The system is intentionally split:

| System     | Role         |
| ---------- | ------------ |
| Ethereum   | Truth        |
| Gemini     | Intelligence |
| Database   | State        |
| Simulation | Narrative    |

---

# 18. FINAL ARCHITECTURE SUMMARY

OICE is composed of:

- A React-based interactive frontend
- A modular API backend
- A Gemini-powered intelligence engine
- A Solidity-based escrow system
- A PostgreSQL state layer
- A deterministic simulation engine
- A graph-based innovation visualization system

---

# END OF SYSTEM ARCHITECTURE
