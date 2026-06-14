import type { CreateIndexesOptions, IndexDescription } from "mongodb";
import { collections } from "@/services/database/collections";

type CollectionIndexes = {
  readonly collection: string;
  readonly indexes: ReadonlyArray<IndexDescription & CreateIndexesOptions>;
};

export const databaseIndexes: ReadonlyArray<CollectionIndexes> = [
  {
    collection: collections.users,
    indexes: [
      { key: { walletAddress: 1 }, unique: true, name: "users_walletAddress_unique" },
      { key: { username: 1 }, sparse: true, name: "users_username_lookup" },
    ],
  },
  {
    collection: collections.innovations,
    indexes: [
      { key: { creatorId: 1, createdAt: -1 }, name: "innovations_creator_createdAt" },
      { key: { status: 1, createdAt: -1 }, name: "innovations_status_createdAt" },
      { key: { title: "text", summary: "text", description: "text" }, name: "innovations_text" },
    ],
  },
  {
    collection: collections.contributions,
    indexes: [
      { key: { innovationId: 1, createdAt: -1 }, name: "contributions_innovation_createdAt" },
      { key: { contributorId: 1, createdAt: -1 }, name: "contributions_contributor_createdAt" },
      { key: { onChainContributionId: 1 }, sparse: true, name: "contributions_onChain_id" },
    ],
  },
  {
    collection: collections.proofs,
    indexes: [
      { key: { contributionId: 1 }, name: "proofs_contribution" },
      { key: { proofHash: 1 }, unique: true, name: "proofs_hash_unique" },
      { key: { onChainProofId: 1 }, sparse: true, name: "proofs_onChain_id" },
      { key: { txHash: 1 }, sparse: true, name: "proofs_txHash" },
    ],
  },
  {
    collection: collections.contractEvents,
    indexes: [
      { key: { chainId: 1, txHash: 1, logIndex: 1 }, unique: true, name: "events_unique_log" },
      { key: { blockNumber: 1 }, name: "events_blockNumber" },
      { key: { eventName: 1, createdAt: -1 }, name: "events_name_createdAt" },
    ],
  },
  {
    collection: collections.fundingEvents,
    indexes: [
      { key: { innovationId: 1, createdAt: -1 }, name: "funding_innovation_createdAt" },
      { key: { chainId: 1, txHash: 1 }, unique: true, name: "funding_chain_tx_unique" },
      { key: { sponsorAddress: 1, createdAt: -1 }, name: "funding_sponsor_createdAt" },
    ],
  },
  {
    collection: collections.milestones,
    indexes: [
      { key: { innovationId: 1, createdAt: 1 }, name: "milestones_innovation_createdAt" },
      { key: { status: 1, updatedAt: -1 }, name: "milestones_status_updatedAt" },
      { key: { chainId: 1, txHash: 1 }, unique: true, sparse: true, name: "milestones_chain_tx_unique" },
    ],
  },
  {
    collection: collections.milestoneProposals,
    indexes: [
      { key: { innovationId: 1, createdAt: -1 }, name: "milestone_proposals_innovation_createdAt" },
      { key: { status: 1, updatedAt: -1 }, name: "milestone_proposals_status_updatedAt" },
      { key: { proposerAddress: 1, createdAt: -1 }, name: "milestone_proposals_proposer_createdAt" },
    ],
  },
  {
    collection: collections.escrowTransactions,
    indexes: [
      { key: { chainId: 1, txHash: 1, logIndex: 1 }, unique: true, name: "escrow_transactions_unique_log" },
      { key: { innovationId: 1, blockNumber: -1 }, name: "escrow_transactions_innovation_block" },
      { key: { eventName: 1, createdAt: -1 }, name: "escrow_transactions_event_createdAt" },
    ],
  },
  {
    collection: collections.rewards,
    indexes: [
      { key: { innovationId: 1, createdAt: -1 }, name: "rewards_innovation_createdAt" },
      { key: { contributionId: 1 }, name: "rewards_contribution" },
      { key: { walletAddress: 1, createdAt: -1 }, name: "rewards_wallet_createdAt" },
      { key: { chainId: 1, txHash: 1, contributionId: 1 }, unique: true, name: "rewards_chain_tx_contribution_unique" },
    ],
  },
  {
    collection: collections.bounties,
    indexes: [
      { key: { innovationId: 1, createdAt: -1 }, name: "bounties_innovation_createdAt" },
      { key: { status: 1, createdAt: -1 }, name: "bounties_status_createdAt" },
      { key: { category: 1, status: 1, createdAt: -1 }, name: "bounties_category_status_createdAt" },
      { key: { createdBy: 1, createdAt: -1 }, name: "bounties_owner_createdAt" },
    ],
  },
  {
    collection: collections.bountySubmissions,
    indexes: [
      { key: { bountyId: 1, submittedAt: -1 }, name: "bounty_submissions_bounty_submittedAt" },
      { key: { innovationId: 1, submittedAt: -1 }, name: "bounty_submissions_innovation_submittedAt" },
      { key: { contributorWallet: 1, submittedAt: -1 }, name: "bounty_submissions_contributor_submittedAt" },
      { key: { status: 1, submittedAt: -1 }, name: "bounty_submissions_status_submittedAt" },
    ],
  },
  {
    collection: collections.hypercertificates,
    indexes: [{ key: { innovationId: 1 }, unique: true, name: "hypercertificates_innovation_unique" }],
  },
  {
    collection: collections.aiRuns,
    indexes: [
      { key: { subjectType: 1, subjectId: 1, createdAt: -1 }, name: "ai_runs_subject" },
      { key: { cacheKey: 1 }, unique: true, sparse: true, name: "ai_runs_cacheKey_unique" },
    ],
  },
];
