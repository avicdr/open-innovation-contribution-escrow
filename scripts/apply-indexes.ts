import { MongoClient, type CreateIndexesOptions, type IndexDescription } from "mongodb";

type CollectionIndexes = {
  readonly collection: string;
  readonly indexes: ReadonlyArray<IndexDescription & CreateIndexesOptions>;
};

const databaseIndexes: ReadonlyArray<CollectionIndexes> = [
  {
    collection: "users",
    indexes: [
      { key: { walletAddress: 1 }, unique: true, name: "users_walletAddress_unique" },
      { key: { username: 1 }, sparse: true, name: "users_username_lookup" },
    ],
  },
  {
    collection: "innovations",
    indexes: [
      { key: { creatorId: 1, createdAt: -1 }, name: "innovations_creator_createdAt" },
      { key: { status: 1, createdAt: -1 }, name: "innovations_status_createdAt" },
      { key: { title: "text", summary: "text", description: "text" }, name: "innovations_text" },
    ],
  },
  {
    collection: "contributions",
    indexes: [
      { key: { innovationId: 1, createdAt: -1 }, name: "contributions_innovation_createdAt" },
      { key: { contributorId: 1, createdAt: -1 }, name: "contributions_contributor_createdAt" },
      { key: { onChainContributionId: 1 }, sparse: true, name: "contributions_onChain_id" },
    ],
  },
  {
    collection: "proofs",
    indexes: [
      { key: { contributionId: 1 }, name: "proofs_contribution" },
      { key: { proofHash: 1 }, unique: true, name: "proofs_hash_unique" },
      { key: { onChainProofId: 1 }, sparse: true, name: "proofs_onChain_id" },
      { key: { txHash: 1 }, sparse: true, name: "proofs_txHash" },
    ],
  },
  {
    collection: "funding_events",
    indexes: [
      { key: { innovationId: 1, createdAt: -1 }, name: "funding_innovation_createdAt" },
      { key: { chainId: 1, txHash: 1 }, unique: true, name: "funding_chain_tx_unique" },
      { key: { sponsorAddress: 1, createdAt: -1 }, name: "funding_sponsor_createdAt" },
    ],
  },
  {
    collection: "milestones",
    indexes: [
      { key: { innovationId: 1, createdAt: 1 }, name: "milestones_innovation_createdAt" },
      { key: { status: 1, updatedAt: -1 }, name: "milestones_status_updatedAt" },
      { key: { chainId: 1, txHash: 1 }, unique: true, sparse: true, name: "milestones_chain_tx_unique" },
    ],
  },
  {
    collection: "milestone_proposals",
    indexes: [
      { key: { innovationId: 1, createdAt: -1 }, name: "milestone_proposals_innovation_createdAt" },
      { key: { status: 1, updatedAt: -1 }, name: "milestone_proposals_status_updatedAt" },
      { key: { proposerAddress: 1, createdAt: -1 }, name: "milestone_proposals_proposer_createdAt" },
    ],
  },
  {
    collection: "escrow_transactions",
    indexes: [
      { key: { chainId: 1, txHash: 1, logIndex: 1 }, unique: true, name: "escrow_transactions_unique_log" },
      { key: { innovationId: 1, blockNumber: -1 }, name: "escrow_transactions_innovation_block" },
      { key: { eventName: 1, createdAt: -1 }, name: "escrow_transactions_event_createdAt" },
    ],
  },
  {
    collection: "rewards",
    indexes: [
      { key: { innovationId: 1, createdAt: -1 }, name: "rewards_innovation_createdAt" },
      { key: { contributionId: 1 }, name: "rewards_contribution" },
      { key: { walletAddress: 1, createdAt: -1 }, name: "rewards_wallet_createdAt" },
      { key: { chainId: 1, txHash: 1, contributionId: 1 }, unique: true, name: "rewards_chain_tx_contribution_unique" },
    ],
  },
  {
    collection: "contract_events",
    indexes: [
      { key: { chainId: 1, txHash: 1, logIndex: 1 }, unique: true, name: "events_unique_log" },
      { key: { blockNumber: 1 }, name: "events_blockNumber" },
      { key: { eventName: 1, createdAt: -1 }, name: "events_name_createdAt" },
    ],
  },
  {
    collection: "hypercertificates",
    indexes: [{ key: { innovationId: 1 }, unique: true, name: "hypercertificates_innovation_unique" }],
  },
  {
    collection: "ai_runs",
    indexes: [
      { key: { subjectType: 1, subjectId: 1, createdAt: -1 }, name: "ai_runs_subject" },
      { key: { cacheKey: 1 }, unique: true, sparse: true, name: "ai_runs_cacheKey_unique" },
    ],
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB ?? "oice";

  if (!uri) {
    throw new Error("MONGODB_URI is required.");
  }

  const client = new MongoClient(uri, {
    appName: "oice-indexer",
  });

  await client.connect();

  try {
    const db = client.db(dbName);

    for (const collectionConfig of databaseIndexes) {
      await db.collection(collectionConfig.collection).createIndexes([...collectionConfig.indexes]);
      console.log(`Applied ${collectionConfig.indexes.length} indexes on ${collectionConfig.collection}`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
