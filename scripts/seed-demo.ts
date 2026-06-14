import { ObjectId, MongoClient, type Collection, type Document } from "mongodb";

const collections = {
  users: "users",
  innovations: "innovations",
  contributions: "contributions",
  proofs: "proofs",
  validations: "validations",
  fundingEvents: "funding_events",
  milestones: "milestones",
  milestoneProposals: "milestone_proposals",
  rewards: "rewards",
  escrowTransactions: "escrow_transactions",
  hypercertificates: "hypercertificates",
  simulations: "simulations",
  aiRuns: "ai_runs",
  contractEvents: "contract_events",
  dnaGraphSnapshots: "dna_graph_snapshots",
};

const now = new Date();
const innovationId = new ObjectId("665000000000000000000001");
const batteryInnovationId = new ObjectId("665000000000000000000011");
const meshInnovationId = new ObjectId("665000000000000000000012");
const aliceId = new ObjectId("665000000000000000000101");
const bobId = new ObjectId("665000000000000000000102");
const carolId = new ObjectId("665000000000000000000103");
const contributionAId = new ObjectId("665000000000000000000201");
const contributionBId = new ObjectId("665000000000000000000202");
const contributionCId = new ObjectId("665000000000000000000203");
const milestoneId = new ObjectId("665000000000000000000301");

const wallets = {
  alice: "0x1111111111111111111111111111111111111111",
  bob: "0x2222222222222222222222222222222222222222",
  carol: "0x3333333333333333333333333333333333333333",
  sponsor: "0x4444444444444444444444444444444444444444",
  approver: "0x5555555555555555555555555555555555555555",
};

async function upsertById(collection: Collection<Document>, _id: ObjectId, document: Record<string, unknown>) {
  await collection.updateOne(
    { _id },
    {
      $setOnInsert: {
        _id,
        createdAt: now,
      },
      $set: {
        ...document,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB ?? "oice";

  if (!uri) {
    throw new Error("MONGODB_URI is required to seed demo data.");
  }

  const client = new MongoClient(uri, { appName: "oice-demo-seed" });
  await client.connect();

  try {
    const db = client.db(dbName);

    await Promise.all([
      upsertById(db.collection(collections.users), aliceId, {
        walletAddress: wallets.alice,
        username: "Alice Chen",
        avatar: "/avatars/alice.png",
        bio: "Smart contract engineer focused on resilient public infrastructure.",
        roles: ["PROJECT_OWNER", "CONTRIBUTOR"],
        reputationScore: 91,
      }),
      upsertById(db.collection(collections.users), bobId, {
        walletAddress: wallets.bob,
        username: "Bob Mensah",
        avatar: "/avatars/bob.png",
        bio: "Climate data researcher building open prediction datasets.",
        roles: ["CONTRIBUTOR", "VALIDATOR"],
        reputationScore: 86,
      }),
      upsertById(db.collection(collections.users), carolId, {
        walletAddress: wallets.carol,
        username: "Carol Rivera",
        avatar: "/avatars/carol.png",
        bio: "Community operator turning early users into validation networks.",
        roles: ["CONTRIBUTOR"],
        reputationScore: 79,
      }),
    ]);

    await upsertById(db.collection(collections.innovations), innovationId, {
      title: "AI Flood Prediction Network",
      summary: "An open network that combines local sensor feeds, satellite data, and AI forecasting to predict flood risk earlier.",
      description:
        "AI Flood Prediction Network coordinates researchers, engineers, and community responders around verifiable flood-risk models, sensor data, and early-warning workflows.",
      category: "Climate Infrastructure",
      creatorId: aliceId.toHexString(),
      creatorWalletAddress: wallets.alice,
      tags: ["climate", "ai", "public infrastructure", "resilience"],
      websiteUrl: "https://example.org/oice-flood-network",
      githubUrl: "https://github.com/example/oice-flood-network",
      ipfsHash: "bafybeifloodpredictiondemo",
      status: "active",
      chainId: 84532,
      onChainInnovationId: "1",
      aiCopilot: {
        inputQuality: "CLEAR",
        planReliability: 78,
        informationGaps: ["Municipal deployment partner", "Live sensor availability by region", "Alert response SLA"],
        clarifyingQuestions: [
          "Which flood-prone region is the first deployment target?",
          "Which sensor feeds are already licensed or public?",
          "Who validates alerts before they reach responders?",
        ],
        requiredRoles: ["AI/ML Engineer", "Backend Developer", "Hydrology Researcher", "Growth Marketer"],
        milestones: [
          {
            title: "Baseline Forecast Model",
            description: "Train and publish an initial flood-risk model with reproducible evaluation data.",
            estimatedTime: "3 weeks",
          },
          {
            title: "Sensor Proof Pipeline",
            description: "Anchor incoming sensor-feed proofs and model release artifacts on-chain.",
            estimatedTime: "2 weeks",
          },
          {
            title: "Responder Pilot",
            description: "Validate alerts with local responders in one high-risk region.",
            estimatedTime: "4 weeks",
          },
        ],
        timeline: "9-12 weeks to a validated pilot",
        budgetEstimate: "6-10 ETH equivalent for data, engineering, and field operations",
        risks: ["Noisy sensor data", "Regional model bias", "Slow field validation loops"],
        opportunities: ["Municipal resilience grants", "Open climate data partnerships", "Reusable proof pipeline"],
        successProbability: 78,
        reasoning: "The project has a strong data moat and clear field validation path, but needs disciplined sensor QA.",
        generatedAt: now,
      },
      innovationScore: 82,
      executionProbability: 74,
      capitalEfficiency: 1.7,
    });

    await upsertById(db.collection(collections.innovations), batteryInnovationId, {
      title: "Open Battery Materials Lab",
      summary: "A reproducible research network for battery material experiments, literature review, and public lab notes.",
      description:
        "Open Battery Materials Lab coordinates researchers, data engineers, and documentation contributors around transparent battery materials experiments.",
      category: "Energy",
      creatorId: bobId.toHexString(),
      creatorWalletAddress: wallets.bob,
      tags: ["energy", "materials", "research", "open science"],
      websiteUrl: "https://example.org/oice-battery-lab",
      githubUrl: "https://github.com/example/oice-battery-lab",
      ipfsHash: "bafybeibatterylabdemo",
      status: "active",
      chainId: 84532,
      onChainInnovationId: "2",
      aiCopilot: {
        inputQuality: "CLEAR",
        planReliability: 72,
        informationGaps: ["Initial lab protocol source", "Replication partner availability", "Data license requirements"],
        clarifyingQuestions: [
          "Which chemistry family is the first research focus?",
          "What minimum metadata is required for each experiment?",
          "Who signs off on replication quality?",
        ],
        requiredRoles: ["Materials Scientist", "Data Engineer", "Technical Writer", "Research Analyst"],
        milestones: [
          {
            title: "Protocol Canonicalization",
            description: "Convert initial battery-material experiment notes into reproducible open protocols.",
            estimatedTime: "2 weeks",
          },
          {
            title: "Experiment Result Index",
            description: "Publish a structured result index with proof hashes for source lab notebooks.",
            estimatedTime: "3 weeks",
          },
          {
            title: "Peer Review Sprint",
            description: "Coordinate external reviewers and reward validated replication contributions.",
            estimatedTime: "3 weeks",
          },
        ],
        timeline: "8-10 weeks to a peer-reviewed dataset",
        budgetEstimate: "4-7 ETH equivalent for review, data engineering, and replication bounties",
        risks: ["Inconsistent experiment metadata", "Replication delays", "Narrow contributor pool"],
        opportunities: ["University lab partnerships", "Open science grant eligibility", "Reusable protocol templates"],
        successProbability: 71,
        reasoning: "The research workflow is promising, with execution risk concentrated around reproducibility discipline.",
        generatedAt: now,
      },
      innovationScore: 76,
      executionProbability: 69,
      capitalEfficiency: 1.3,
    });

    await upsertById(db.collection(collections.innovations), meshInnovationId, {
      title: "Community Mesh Response Kit",
      summary: "Offline-first mesh communications for disaster response teams, validators, and local coordinators.",
      description:
        "Community Mesh Response Kit creates a resilient communication toolkit for response teams operating with unreliable connectivity.",
      category: "Resilience",
      creatorId: carolId.toHexString(),
      creatorWalletAddress: wallets.carol,
      tags: ["resilience", "mesh", "response", "community"],
      websiteUrl: "https://example.org/oice-mesh-kit",
      githubUrl: "https://github.com/example/oice-mesh-kit",
      ipfsHash: "bafybeimeshkitdemo",
      status: "active",
      chainId: 84532,
      onChainInnovationId: "3",
      aiCopilot: {
        inputQuality: "CLEAR",
        planReliability: 68,
        informationGaps: ["Hardware bill of materials", "Emergency responder pilot partner", "Offline range requirements"],
        clarifyingQuestions: [
          "Which disaster scenario is the first field test designed around?",
          "What hardware constraints must the kit satisfy?",
          "How will response teams report reliability issues?",
        ],
        requiredRoles: ["Backend Developer", "Hardware Prototyper", "Community Manager", "UX Designer"],
        milestones: [
          {
            title: "Offline Messaging Prototype",
            description: "Ship a working local mesh messaging prototype with basic delivery telemetry.",
            estimatedTime: "3 weeks",
          },
          {
            title: "Field Kit Documentation",
            description: "Create assembly, deployment, and operator guides for responder teams.",
            estimatedTime: "2 weeks",
          },
          {
            title: "Community Drill",
            description: "Run a field drill and capture proof-backed feedback from operators.",
            estimatedTime: "4 weeks",
          },
        ],
        timeline: "9-11 weeks to a field-tested kit",
        budgetEstimate: "5-8 ETH equivalent for hardware, documentation, and response-team pilots",
        risks: ["Hardware supply variance", "Connectivity edge cases", "Responder training burden"],
        opportunities: ["Disaster response NGO adoption", "Local manufacturing partners", "Reusable emergency comms playbook"],
        successProbability: 67,
        reasoning: "The project has strong mission fit, but depends on field ergonomics and reliable hardware sourcing.",
        generatedAt: now,
      },
      innovationScore: 71,
      executionProbability: 64,
      capitalEfficiency: 1.1,
    });

    const contributions = [
      {
        _id: contributionAId,
        contributorId: aliceId.toHexString(),
        contributorWalletAddress: wallets.alice,
        title: "Escrow contract and proof registry",
        description: "Implemented the Solidity escrow flow and proof anchoring event model.",
        type: "engineering",
        proofUri: "ipfs://bafyproofsmartcontract",
        proofHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        onChainContributionId: "1",
        onChainProofId: "1",
        txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1",
        aiScore: {
          originality: 86,
          effort: 94,
          complexity: 92,
          usefulness: 95,
          impact: 94,
          overallScore: 94,
          confidence: 88,
          reasoning: "High leverage infrastructure that makes rewards auditable and proofs immutable.",
        },
        impactScore: 94,
      },
      {
        _id: contributionBId,
        contributorId: bobId.toHexString(),
        contributorWalletAddress: wallets.bob,
        title: "Flood risk research dataset",
        description: "Curated regional rainfall, river-level, and satellite anomaly data for model validation.",
        type: "research",
        proofUri: "ipfs://bafyproofdataset",
        proofHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        onChainContributionId: "2",
        onChainProofId: "2",
        txHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb2",
        aiScore: {
          originality: 81,
          effort: 89,
          complexity: 84,
          usefulness: 91,
          impact: 86,
          overallScore: 86,
          confidence: 84,
          reasoning: "Strong research input that improves model reliability and readiness.",
        },
        impactScore: 86,
      },
      {
        _id: contributionCId,
        contributorId: carolId.toHexString(),
        contributorWalletAddress: wallets.carol,
        title: "Community responder onboarding",
        description: "Built the validation loop for local responders and field observers.",
        type: "community",
        proofUri: "ipfs://bafyproofcommunity",
        proofHash: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        onChainContributionId: "3",
        onChainProofId: "3",
        txHash: "0xccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc3",
        aiScore: {
          originality: 72,
          effort: 82,
          complexity: 68,
          usefulness: 88,
          impact: 78,
          overallScore: 78,
          confidence: 82,
          reasoning: "Turns technical outputs into field adoption and validation coverage.",
        },
        impactScore: 78,
      },
    ];

    for (const contribution of contributions) {
      const { _id, ...document } = contribution;
      await upsertById(db.collection(collections.contributions), _id, {
        ...document,
        innovationId: innovationId.toHexString(),
        chainId: 84532,
      });

      await db.collection(collections.proofs).updateOne(
        { proofHash: contribution.proofHash },
        {
          $setOnInsert: {
            createdAt: now,
          },
          $set: {
            innovationId: innovationId.toHexString(),
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

    await upsertById(db.collection(collections.milestones), milestoneId, {
      innovationId: innovationId.toHexString(),
      title: "Prototype Complete",
      description: "Forecast dashboard, proof anchoring, and responder feedback loop are connected.",
      status: "approved",
      approverAddress: wallets.approver,
      chainId: 84532,
      txHash: "0xddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd4",
      blockNumber: 12345678,
      approvedAt: now,
    });

    await db.collection(collections.milestoneProposals).updateOne(
      { _id: new ObjectId("665000000000000000000311") },
      {
        $setOnInsert: {
          _id: new ObjectId("665000000000000000000311"),
          createdAt: now,
        },
        $set: {
          innovationId: innovationId.toHexString(),
          proposerAddress: wallets.carol,
          title: "Responder Pilot Expansion",
          description: "Expand the field responder validation loop to two additional flood-prone regions.",
          status: "PENDING",
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    await db.collection(collections.fundingEvents).updateOne(
      { chainId: 84532, txHash: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee5" },
      {
        $setOnInsert: { createdAt: now },
        $set: {
          innovationId: innovationId.toHexString(),
          sponsorAddress: wallets.sponsor,
          amountWei: "2000000000000000000",
          chainId: 84532,
          txHash: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee5",
          blockNumber: 12345670,
        },
      },
      { upsert: true },
    );

    await db.collection(collections.escrowTransactions).updateOne(
      { chainId: 84532, txHash: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee5", logIndex: 0 },
      {
        $setOnInsert: { createdAt: now },
        $set: {
          innovationId: innovationId.toHexString(),
          chainId: 84532,
          contractAddress: "0x9999999999999999999999999999999999999999",
          eventName: "FundsDeposited",
          txHash: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee5",
          blockNumber: 12345670,
          logIndex: 0,
          args: {
            innovationId: innovationId.toHexString(),
            sponsor: wallets.sponsor,
            amount: "2000000000000000000",
          },
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    await db.collection(collections.rewards).deleteMany({ innovationId: innovationId.toHexString() });
    await db.collection(collections.rewards).insertMany([
      {
        innovationId: innovationId.toHexString(),
        milestoneId: milestoneId.toHexString(),
        contributionId: contributionAId.toHexString(),
        walletAddress: wallets.alice,
        amountWei: "500000000000000000",
        score: 50,
        distributorAddress: wallets.approver,
        chainId: 84532,
        txHash: "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6",
        blockNumber: 12345690,
        createdAt: now,
      },
      {
        innovationId: innovationId.toHexString(),
        milestoneId: milestoneId.toHexString(),
        contributionId: contributionBId.toHexString(),
        walletAddress: wallets.bob,
        amountWei: "300000000000000000",
        score: 30,
        distributorAddress: wallets.approver,
        chainId: 84532,
        txHash: "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6",
        blockNumber: 12345690,
        createdAt: now,
      },
      {
        innovationId: innovationId.toHexString(),
        milestoneId: milestoneId.toHexString(),
        contributionId: contributionCId.toHexString(),
        walletAddress: wallets.carol,
        amountWei: "200000000000000000",
        score: 20,
        distributorAddress: wallets.approver,
        chainId: 84532,
        txHash: "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6",
        blockNumber: 12345690,
        createdAt: now,
      },
    ]);

    await db.collection(collections.hypercertificates).updateOne(
      { innovationId: innovationId.toHexString() },
      {
        $setOnInsert: { createdAt: now },
        $set: {
          innovationId: innovationId.toHexString(),
          summary: "A verified climate infrastructure project with anchored contribution proofs and escrow-backed reward history.",
          impactStatement: "Improves flood readiness by coordinating open data, local validation, and accountable funding.",
          futurePotential: "Can expand to multi-region responder networks and municipal grant review workflows.",
          readinessScore: 82,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    await db.collection(collections.dnaGraphSnapshots).updateOne(
      { innovationId: innovationId.toHexString(), name: "demo" },
      {
        $setOnInsert: { createdAt: now },
        $set: {
          innovationId: innovationId.toHexString(),
          name: "demo",
          nodes: [
            "innovation",
            "alice",
            "bob",
            "carol",
            "smart-contract",
            "dataset",
            "growth",
            "funding",
            "milestone",
            "reward",
          ],
          edges: 10,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    await db.collection(collections.simulations).updateOne(
      { name: "AI Flood Prediction Network Demo" },
      {
        $setOnInsert: { createdAt: now },
        $set: {
          name: "AI Flood Prediction Network Demo",
          status: "ready",
          currentStep: "COMPLETE",
          progress: 100,
          innovationId: innovationId.toHexString(),
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    console.log(`Seeded OICE demo data into ${dbName}.`);
    console.log(`Demo innovation id: ${innovationId.toHexString()}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
