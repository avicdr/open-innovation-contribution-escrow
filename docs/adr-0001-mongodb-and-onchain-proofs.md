# ADR 0001: MongoDB Read Model And On-Chain Proof Anchoring

## Status

Accepted.

## Context

The original documentation specified PostgreSQL/Prisma for application state and allowed contribution proof URLs to live in the database. The product direction now requires:

- Proofs anchored on-chain for immutability and contributor trust.
- MongoDB instead of PostgreSQL for application state.

## Decision

OICE uses Ethereum-compatible contracts as the immutable proof and escrow layer. Every contribution proof must be anchored with:

- `proofHash`
- `proofUri`
- contributor address
- innovation ID
- contribution ID
- timestamp

MongoDB is the application read model and stores searchable, denormalized lifecycle data:

- users
- innovations
- contributions
- proofs
- validations
- funding events
- milestones
- rewards
- hypercertificates
- simulations
- AI runs
- contract events
- DNA graph snapshots

MongoDB documents must be validated with Zod at API boundaries. Data displayed as trusted proof must be reconcilable to contract events or direct contract reads.

## Consequences

- API endpoints must not accept unanchored proof submissions as trusted contributions.
- Contract event indexing becomes mandatory before production launch.
- AI outputs can inform scoring and analysis, but payout-critical values must be explicitly anchored or authorized on-chain.
- Flexible MongoDB documents support evolving AI, graph, simulation, and hypercertificate payloads without premature relational migration churn.
