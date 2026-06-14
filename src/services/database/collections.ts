export const collections = {
  users: "users",
  innovations: "innovations",
  contributions: "contributions",
  proofs: "proofs",
  validations: "validations",
  fundingEvents: "funding_events",
  milestones: "milestones",
  milestoneProposals: "milestone_proposals",
  rewards: "rewards",
  bounties: "bounties",
  bountySubmissions: "bounty_submissions",
  escrowTransactions: "escrow_transactions",
  hypercertificates: "hypercertificates",
  simulations: "simulations",
  aiRuns: "ai_runs",
  contractEvents: "contract_events",
  dnaGraphSnapshots: "dna_graph_snapshots",
  authNonces: "auth_nonces",
  sessions: "sessions",
} as const;

export type CollectionName = (typeof collections)[keyof typeof collections];
