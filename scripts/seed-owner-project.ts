import { ObjectId, MongoClient, type Collection, type Document } from "mongodb";

const collections = {
  users: "users",
  innovations: "innovations",
  contributions: "contributions",
  proofs: "proofs",
  fundingEvents: "funding_events",
  milestones: "milestones",
  milestoneProposals: "milestone_proposals",
  rewards: "rewards",
  escrowTransactions: "escrow_transactions",
  hypercertificates: "hypercertificates",
};

const now = new Date();

// Project owner requested for a fully-complete demo project. Stored lowercased
// to match how the app queries creatorWalletAddress (see My Projects page).
const ownerWallet = "0x7d940a8650001d9e4ea3538f7bc290bd296b35bd";

const wallets = {
  owner: ownerWallet,
  researcher: "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
  designer: "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
  writer: "0xc3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3",
  sponsorA: "0xd4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4",
  sponsorB: "0xe5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5",
};

const ownerUserId = new ObjectId("665000000000000000000121");
const innovationId = new ObjectId("665000000000000000000021");
const contributionIds = {
  engineering: new ObjectId("665000000000000000000221"),
  research: new ObjectId("665000000000000000000222"),
  design: new ObjectId("665000000000000000000223"),
  documentation: new ObjectId("665000000000000000000224"),
};
const milestoneIds = {
  prototype: new ObjectId("665000000000000000000321"),
  pilot: new ObjectId("665000000000000000000322"),
};
const proposalIds = {
  approved: new ObjectId("665000000000000000000331"),
  pending: new ObjectId("665000000000000000000332"),
};

/** Build a deterministic 64-hex hash from a 2-char seed. */
function hash(seed: string) {
  return `0x${seed.repeat(32)}`;
}

async function upsertById(collection: Collection<Document>, _id: ObjectId, document: Record<string, unknown>) {
  await collection.updateOne(
    { _id },
    { $setOnInsert: { _id, createdAt: now }, $set: { ...document, updatedAt: now } },
    { upsert: true },
  );
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB ?? "oice";

  if (!uri) {
    throw new Error("MONGODB_URI is required to seed the owner project.");
  }

  const client = new MongoClient(uri, { appName: "oice-owner-seed" });
  await client.connect();

  try {
    const db = client.db(dbName);
    const innovationIdHex = innovationId.toHexString();

    // Owner profile — upsert by wallet (a user with this wallet may already exist
    // from signing in; walletAddress has a unique index).
    await db.collection(collections.users).updateOne(
      { walletAddress: wallets.owner },
      {
        $setOnInsert: { createdAt: now, walletAddress: wallets.owner },
        $set: {
          username: "Project Owner",
          bio: "Founder coordinating a fully shipped clean-energy innovation on OICE.",
          roles: ["PROJECT_OWNER", "CONTRIBUTOR"],
          reputationScore: 96,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    // Innovation — completed, on-chain, with a full AI plan.
    await upsertById(db.collection(collections.innovations), innovationId, {
      title: "SolarGrid Autonomous Microgrid",
      summary:
        "An autonomous, AI-balanced solar microgrid that lets neighborhoods share, store, and settle clean energy on-chain.",
      description:
        "SolarGrid coordinates engineers, researchers, designers, and documentation contributors around a verifiable autonomous microgrid: AI load balancing, on-chain energy settlement, and a responder-grade reliability layer. The project is fully delivered — proofs anchored, escrow funded, milestones approved, and rewards distributed.",
      category: "Energy Infrastructure",
      creatorId: ownerUserId.toHexString(),
      creatorWalletAddress: wallets.owner,
      tags: ["energy", "ai", "defi", "infrastructure", "sustainability"],
      websiteUrl: "https://example.org/oice-solargrid",
      githubUrl: "https://github.com/example/oice-solargrid",
      ipfsHash: "bafybeisolargridcomplete",
      status: "completed",
      chainId: 84532,
      onChainInnovationId: "21",
      aiCopilot: {
        inputQuality: "CLEAR",
        planReliability: 90,
        informationGaps: [],
        clarifyingQuestions: [],
        requiredRoles: ["Smart Contract Engineer", "Power Systems Researcher", "Product Designer", "Technical Writer"],
        milestones: [
          {
            title: "Settlement Contract + Load Balancer",
            description: "Ship the on-chain energy settlement contract and the AI load-balancing service.",
            estimatedTime: "4 weeks",
          },
          {
            title: "Neighborhood Pilot",
            description: "Deploy to a pilot neighborhood and validate reliability under real load.",
            estimatedTime: "5 weeks",
          },
        ],
        timeline: "Delivered in 9 weeks",
        budgetEstimate: "4 ETH escrowed, 3 ETH distributed to contributors",
        risks: ["Grid hardware variance across homes", "Regulatory approval for energy resale"],
        opportunities: ["Municipal clean-energy grants", "Replicable microgrid template", "Carbon-credit settlement"],
        successProbability: 92,
        reasoning:
          "Fully executed project: anchored proofs, funded escrow, approved milestones, and score-weighted rewards distributed. Strong reliability data and a reusable settlement layer.",
        generatedAt: now,
      },
      innovationScore: 90,
      executionProbability: 94,
      capitalEfficiency: 2.1,
    });

    // Contributions — each proof-anchored on-chain and AI-scored.
    const contributions = [
      {
        _id: contributionIds.engineering,
        contributorWalletAddress: wallets.owner,
        title: "On-chain energy settlement contract",
        description: "Implemented the Solidity settlement and metering contract with proof anchoring for each energy epoch.",
        type: "engineering",
        proofUri: "ipfs://bafyproofsolargridcontract",
        proofHash: hash("a1"),
        onChainContributionId: "21",
        onChainProofId: "21",
        txHash: hash("a2"),
        score: 95,
      },
      {
        _id: contributionIds.research,
        contributorWalletAddress: wallets.researcher,
        title: "AI load-balancing model + dataset",
        description: "Built and validated the demand-forecasting model and the reliability dataset behind autonomous balancing.",
        type: "research",
        proofUri: "ipfs://bafyproofsolargridmodel",
        proofHash: hash("b1"),
        onChainContributionId: "22",
        onChainProofId: "22",
        txHash: hash("b2"),
        score: 88,
      },
      {
        _id: contributionIds.design,
        contributorWalletAddress: wallets.designer,
        title: "Operator + resident dashboards",
        description: "Designed the microgrid operator console and the resident energy-sharing experience.",
        type: "design",
        proofUri: "ipfs://bafyproofsolargriddesign",
        proofHash: hash("c1"),
        onChainContributionId: "23",
        onChainProofId: "23",
        txHash: hash("c2"),
        score: 80,
      },
      {
        _id: contributionIds.documentation,
        contributorWalletAddress: wallets.writer,
        title: "Deployment + reliability playbook",
        description: "Authored the deployment, settlement, and reliability runbooks used in the neighborhood pilot.",
        type: "documentation",
        proofUri: "ipfs://bafyproofsolargriddocs",
        proofHash: hash("d1"),
        onChainContributionId: "24",
        onChainProofId: "24",
        txHash: hash("d2"),
        score: 72,
      },
    ] as const;

    for (const contribution of contributions) {
      const { _id, score, ...rest } = contribution;
      await upsertById(db.collection(collections.contributions), _id, {
        ...rest,
        innovationId: innovationIdHex,
        chainId: 84532,
        aiScore: {
          originality: Math.max(60, score - 6),
          effort: Math.min(99, score + 3),
          complexity: score,
          usefulness: Math.min(99, score + 2),
          impact: score,
          overallScore: score,
          confidence: 88,
          reasoning: "Validated, proof-backed contribution to the delivered microgrid.",
        },
        impactScore: score,
      });

      await db.collection(collections.proofs).updateOne(
        { proofHash: contribution.proofHash },
        {
          $setOnInsert: { createdAt: now },
          $set: {
            innovationId: innovationIdHex,
            contributionId: _id.toHexString(),
            contributorWalletAddress: contribution.contributorWalletAddress,
            proofHash: contribution.proofHash,
            proofUri: contribution.proofUri,
            chainId: 84532,
            txHash: contribution.txHash,
            onChainProofId: contribution.onChainProofId,
            anchoredAt: now,
            status: "anchored",
            updatedAt: now,
          },
        },
        { upsert: true },
      );
    }

    // Milestones — both approved (UI treats "approved" as complete).
    await upsertById(db.collection(collections.milestones), milestoneIds.prototype, {
      innovationId: innovationIdHex,
      title: "Settlement Contract + Load Balancer",
      description: "On-chain settlement contract and AI load-balancing service shipped and verified.",
      status: "approved",
      approverAddress: wallets.owner,
      chainId: 84532,
      txHash: hash("e1"),
      blockNumber: 20000010,
      approvedAt: now,
    });
    await upsertById(db.collection(collections.milestones), milestoneIds.pilot, {
      innovationId: innovationIdHex,
      title: "Neighborhood Pilot",
      description: "Pilot neighborhood deployment validated under real load with responder-grade reliability.",
      status: "approved",
      approverAddress: wallets.owner,
      chainId: 84532,
      txHash: hash("e2"),
      blockNumber: 20000060,
      approvedAt: now,
    });

    // Milestone proposals — one approved (became a milestone), one pending.
    await upsertById(db.collection(collections.milestoneProposals), proposalIds.approved, {
      innovationId: innovationIdHex,
      proposerAddress: wallets.researcher,
      reviewerAddress: wallets.owner,
      title: "Neighborhood Pilot",
      description: "Deploy to a pilot neighborhood and validate reliability under real load.",
      targetDate: "2026-04-30",
      feedback: "Approved — reliability data exceeded the pilot threshold.",
      status: "APPROVED",
    });
    await upsertById(db.collection(collections.milestoneProposals), proposalIds.pending, {
      innovationId: innovationIdHex,
      proposerAddress: wallets.designer,
      title: "Multi-Neighborhood Rollout",
      description: "Expand the validated microgrid to three adjacent neighborhoods with shared settlement.",
      targetDate: "2026-07-31",
      status: "PENDING",
    });

    // Funding — two sponsor deposits totalling 4 ETH.
    const fundingEvents = [
      { sponsor: wallets.sponsorA, amountWei: "2500000000000000000", txHash: hash("f1"), blockNumber: 20000005 },
      { sponsor: wallets.sponsorB, amountWei: "1500000000000000000", txHash: hash("f2"), blockNumber: 20000007 },
    ];

    for (const event of fundingEvents) {
      await db.collection(collections.fundingEvents).updateOne(
        { chainId: 84532, txHash: event.txHash },
        {
          $setOnInsert: { createdAt: now },
          $set: {
            innovationId: innovationIdHex,
            sponsorAddress: event.sponsor,
            amountWei: event.amountWei,
            chainId: 84532,
            txHash: event.txHash,
            blockNumber: event.blockNumber,
          },
        },
        { upsert: true },
      );

      await db.collection(collections.escrowTransactions).updateOne(
        { chainId: 84532, txHash: event.txHash, logIndex: 0 },
        {
          $setOnInsert: { createdAt: now },
          $set: {
            innovationId: innovationIdHex,
            chainId: 84532,
            contractAddress: "0x9999999999999999999999999999999999999999",
            eventName: "FundsDeposited",
            txHash: event.txHash,
            blockNumber: event.blockNumber,
            logIndex: 0,
            args: { innovationId: innovationIdHex, sponsor: event.sponsor, amount: event.amountWei },
            updatedAt: now,
          },
        },
        { upsert: true },
      );
    }

    // Rewards — 3 ETH distributed by contribution score (1 ETH stays available).
    const rewards = [
      { contributionId: contributionIds.engineering, wallet: wallets.owner, amountWei: "1100000000000000000", score: 95 },
      { contributionId: contributionIds.research, wallet: wallets.researcher, amountWei: "900000000000000000", score: 88 },
      { contributionId: contributionIds.design, wallet: wallets.designer, amountWei: "600000000000000000", score: 80 },
      { contributionId: contributionIds.documentation, wallet: wallets.writer, amountWei: "400000000000000000", score: 72 },
    ];

    await db.collection(collections.rewards).deleteMany({ innovationId: innovationIdHex });
    await db.collection(collections.rewards).insertMany(
      rewards.map((reward) => ({
        innovationId: innovationIdHex,
        milestoneId: milestoneIds.pilot.toHexString(),
        contributionId: reward.contributionId.toHexString(),
        walletAddress: reward.wallet,
        amountWei: reward.amountWei,
        score: reward.score,
        distributorAddress: wallets.owner,
        chainId: 84532,
        txHash: hash("ab"),
        blockNumber: 20000100,
        createdAt: now,
      })),
    );

    // Hypercertificate summary record.
    await db.collection(collections.hypercertificates).updateOne(
      { innovationId: innovationIdHex },
      {
        $setOnInsert: { createdAt: now },
        $set: {
          innovationId: innovationIdHex,
          summary: "A fully delivered autonomous microgrid with anchored proofs, funded escrow, approved milestones, and distributed rewards.",
          impactStatement: "Enables neighborhoods to share and settle clean energy autonomously, on-chain.",
          futurePotential: "Replicable settlement template for multi-neighborhood and municipal clean-energy rollouts.",
          readinessScore: 94,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    console.log(`Seeded completed owner project into ${dbName}.`);
    console.log(`Owner wallet: ${wallets.owner}`);
    console.log(`Innovation id: ${innovationIdHex} (on-chain #21)`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
