import { ObjectId, MongoClient, type Collection, type Document } from "mongodb";

// Seeds a LIVE, mid-flight demo project under the requested owner wallet:
// open project · contributors sending contributions (some scored, some pending)
// · two listed bounties (one with submissions awaiting review) · checkpoints
// with pending proposals ready to approve/reject · funded escrow.
//
// Idempotent: re-running upserts the same deterministic ids.

const collections = {
  users: "users",
  innovations: "innovations",
  contributions: "contributions",
  proofs: "proofs",
  fundingEvents: "funding_events",
  milestones: "milestones",
  milestoneProposals: "milestone_proposals",
  rewards: "rewards",
  bounties: "bounties",
  bountySubmissions: "bounty_submissions",
  escrowTransactions: "escrow_transactions",
};

const now = new Date();
const daysFromNow = (days: number) => new Date(now.getTime() + days * 86_400_000);

const ownerWallet = "0x7d940a8650001d9e4ea3538f7bc290bd296b35bd";

const wallets = {
  owner: ownerWallet,
  alice: "0x1111111111111111111111111111111111111111", // engineer
  bob: "0x2222222222222222222222222222222222222222", // researcher
  carol: "0x3333333333333333333333333333333333333333", // designer
  dave: "0x4444444444444444444444444444444444444444", // community
  erin: "0x5555555555555555555555555555555555555555", // tester
  frank: "0x6666666666666666666666666666666666666666", // writer
  sponsorA: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  sponsorB: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
};

const ownerUserId = new ObjectId("665000000000000000000121");
const innovationId = new ObjectId("665000000000000000000050");

const contributionIds = {
  firmware: new ObjectId("665000000000000000000251"),
  model: new ObjectId("665000000000000000000252"),
  console: new ObjectId("665000000000000000000253"),
  onboarding: new ObjectId("665000000000000000000254"),
  calibration: new ObjectId("665000000000000000000255"), // pending AI score
  runbook: new ObjectId("665000000000000000000256"), // pending AI score
};

const milestoneIds = {
  meshMvp: new ObjectId("665000000000000000000351"), // approved
};

const proposalIds = {
  meshApproved: new ObjectId("665000000000000000000361"), // APPROVED -> became meshMvp
  pilotPending: new ObjectId("665000000000000000000362"), // PENDING (ready to review)
  apiPending: new ObjectId("665000000000000000000363"), // PENDING (ready to review)
};

const bountyIds = {
  webhook: new ObjectId("665000000000000000000451"), // in_review, has submissions
  riskMap: new ObjectId("665000000000000000000452"), // open, no submissions yet
};

const submissionIds = {
  webhookAlice: new ObjectId("665000000000000000000461"), // pending review
  webhookErin: new ObjectId("665000000000000000000462"), // pending review
};

/** Deterministic 64-hex hash from a 2-char seed (numeric seeds avoid the other seed scripts). */
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
    throw new Error("MONGODB_URI is required to seed the live demo project.");
  }

  const client = new MongoClient(uri, { appName: "oice-live-demo-seed" });
  await client.connect();

  try {
    const db = client.db(dbName);
    const innovationIdHex = innovationId.toHexString();

    // Owner profile (upsert by wallet — unique index).
    await db.collection(collections.users).updateOne(
      { walletAddress: wallets.owner },
      {
        $setOnInsert: { createdAt: now, walletAddress: wallets.owner },
        $set: {
          username: "Project Owner",
          bio: "Founder coordinating live innovations on OICE.",
          roles: ["PROJECT_OWNER", "CONTRIBUTOR"],
          reputationScore: 96,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    // Innovation — OPEN / active, on-chain registered, funded, mid-flight.
    await upsertById(db.collection(collections.innovations), innovationId, {
      title: "AeroWatch Wildfire Early-Warning Network",
      summary:
        "A decentralized sensor mesh and AI model that detect wildfire ignition early and push verified alerts to local responders.",
      description:
        "AeroWatch coordinates engineers, ML researchers, designers, field testers, and writers around a community-run wildfire early-warning network. Low-cost edge sensors form a LoRa mesh, an on-device CV model flags smoke and thermal anomalies, and verified alerts are routed to responders. The project is live: contributors are shipping proof-backed work, escrow is funded, two bounties are open, and several checkpoints await owner review.",
      category: "Climate Resilience",
      creatorId: ownerUserId.toHexString(),
      creatorWalletAddress: wallets.owner,
      tags: ["climate", "ai", "sensors", "safety", "infrastructure"],
      websiteUrl: "https://example.org/aerowatch",
      githubUrl: "https://github.com/example/aerowatch",
      ipfsHash: "bafybeiaerowatchlive",
      status: "active",
      chainId: 84532,
      onChainInnovationId: "50",
      aiCopilot: {
        inputQuality: "CLEAR",
        planReliability: 82,
        informationGaps: [],
        clarifyingQuestions: ["Which counties are committed for the first pilot?"],
        requiredRoles: ["Embedded Engineer", "ML Researcher", "Product Designer", "Field Test Lead", "Technical Writer"],
        milestones: [
          { title: "Sensor Mesh MVP", description: "Edge firmware + LoRa mesh detecting smoke in a test enclosure.", estimatedTime: "4 weeks" },
          { title: "County Pilot Deployment", description: "Deploy 25 sensors across a pilot county and validate alert latency.", estimatedTime: "6 weeks" },
          { title: "Open Data API", description: "Public, verifiable alert + telemetry API for responders.", estimatedTime: "3 weeks" },
        ],
        timeline: "Targeting a validated county pilot in ~10 weeks",
        budgetEstimate: "5 ETH escrowed; ~3.75 ETH unallocated for bounties and rewards",
        risks: ["False positives from controlled burns", "Sensor uptime in low-connectivity terrain", "Responder integration approvals"],
        opportunities: ["State wildfire-resilience grants", "Insurance telemetry partnerships", "Replicable mesh template for flood and air-quality networks"],
        successProbability: 78,
        reasoning:
          "Clear problem, committed contributors, funded escrow, and an approved MVP checkpoint. Main risks are field reliability and false-positive tuning, both addressable with the pending pilot and calibration work.",
        generatedAt: now,
      },
      innovationScore: 80,
      executionProbability: 78,
    });

    // Contributions — most AI-scored & anchored; two awaiting evaluation (pending).
    const scoredContributions = [
      {
        _id: contributionIds.firmware,
        contributorWalletAddress: wallets.alice,
        title: "Edge sensor firmware + LoRa mesh",
        description: "Implemented the low-power edge firmware and self-healing LoRa mesh networking for the sensor fleet.",
        type: "engineering",
        proofUri: "ipfs://bafyproofaerofirmware",
        proofHash: hash("11"),
        onChainContributionId: "51",
        onChainProofId: "51",
        txHash: hash("12"),
        score: 91,
      },
      {
        _id: contributionIds.model,
        contributorWalletAddress: wallets.bob,
        title: "On-device smoke-detection CV model",
        description: "Trained and quantized the computer-vision model that flags smoke and thermal anomalies on-device.",
        type: "research",
        proofUri: "ipfs://bafyproofaeromodel",
        proofHash: hash("21"),
        onChainContributionId: "52",
        onChainProofId: "52",
        txHash: hash("22"),
        score: 86,
      },
      {
        _id: contributionIds.console,
        contributorWalletAddress: wallets.carol,
        title: "Responder alert console",
        description: "Designed the responder-facing console for triaging verified alerts with map and severity context.",
        type: "design",
        proofUri: "ipfs://bafyproofaeroconsole",
        proofHash: hash("31"),
        onChainContributionId: "53",
        onChainProofId: "53",
        txHash: hash("32"),
        score: 77,
      },
      {
        _id: contributionIds.onboarding,
        contributorWalletAddress: wallets.dave,
        title: "Pilot county onboarding kit",
        description: "Built the onboarding kit and outreach materials that signed up the first pilot county responders.",
        type: "community",
        proofUri: "ipfs://bafyproofaeroonboarding",
        proofHash: hash("41"),
        onChainContributionId: "54",
        onChainProofId: "54",
        txHash: hash("42"),
        score: 63,
      },
    ] as const;

    for (const contribution of scoredContributions) {
      const { _id, score, ...rest } = contribution;
      await upsertById(db.collection(collections.contributions), _id, {
        ...rest,
        innovationId: innovationIdHex,
        chainId: 84532,
        aiScore: {
          originality: Math.max(55, score - 7),
          effort: Math.min(99, score + 3),
          complexity: score,
          usefulness: Math.min(99, score + 2),
          impact: score,
          overallScore: score,
          confidence: 86,
          reasoning: "Validated, proof-backed contribution to the live wildfire network.",
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

    // Pending-evaluation contributions — submitted, awaiting AI score (no aiScore/impactScore).
    const pendingContributions = [
      {
        _id: contributionIds.calibration,
        contributorWalletAddress: wallets.erin,
        title: "Field calibration dataset",
        description: "Collected and labeled a field calibration dataset to reduce false positives from controlled burns. Awaiting AI evaluation.",
        type: "testing",
        proofUri: "ipfs://bafyproofaerocalibration",
        proofHash: hash("51"),
      },
      {
        _id: contributionIds.runbook,
        contributorWalletAddress: wallets.frank,
        title: "Sensor deployment runbook",
        description: "Drafted the field deployment and maintenance runbook for pilot installers. Awaiting AI evaluation.",
        type: "documentation",
        proofUri: "ipfs://bafyproofaerorunbook",
        proofHash: hash("61"),
      },
    ] as const;

    for (const contribution of pendingContributions) {
      const { _id, ...rest } = contribution;
      await upsertById(db.collection(collections.contributions), _id, {
        ...rest,
        innovationId: innovationIdHex,
        chainId: 84532,
      });
    }

    // Checkpoint (milestone) — one approved MVP.
    await upsertById(db.collection(collections.milestones), milestoneIds.meshMvp, {
      innovationId: innovationIdHex,
      title: "Sensor Mesh MVP",
      description: "Edge firmware and LoRa mesh detect smoke reliably in the test enclosure.",
      status: "approved",
      approverAddress: wallets.owner,
      chainId: 84532,
      txHash: hash("71"),
      blockNumber: 21000010,
      approvedAt: now,
    });

    // Checkpoint proposals — one approved (became the MVP), two PENDING (ready to approve/reject).
    await upsertById(db.collection(collections.milestoneProposals), proposalIds.meshApproved, {
      innovationId: innovationIdHex,
      proposerAddress: wallets.alice,
      reviewerAddress: wallets.owner,
      title: "Sensor Mesh MVP",
      description: "Edge firmware + LoRa mesh detecting smoke in a test enclosure.",
      targetDate: new Date("2026-05-15"),
      feedback: "Approved — detection reliability passed the enclosure threshold.",
      status: "APPROVED",
    });
    await upsertById(db.collection(collections.milestoneProposals), proposalIds.pilotPending, {
      innovationId: innovationIdHex,
      proposerAddress: wallets.bob,
      title: "County Pilot Deployment",
      description: "Deploy 25 sensors across the pilot county and validate end-to-end alert latency under real conditions.",
      targetDate: new Date("2026-07-15"),
      status: "PENDING",
    });
    await upsertById(db.collection(collections.milestoneProposals), proposalIds.apiPending, {
      innovationId: innovationIdHex,
      proposerAddress: wallets.carol,
      title: "Open Data API",
      description: "Ship a public, verifiable alert + telemetry API so responders and researchers can consume the feed.",
      targetDate: new Date("2026-08-01"),
      status: "PENDING",
    });

    // Funding — two sponsor deposits totalling 5 ETH (escrow available for bounties + rewards).
    const fundingEvents = [
      { sponsor: wallets.sponsorA, amountWei: "3000000000000000000", txHash: hash("81"), blockNumber: 21000005 },
      { sponsor: wallets.sponsorB, amountWei: "2000000000000000000", txHash: hash("82"), blockNumber: 21000007 },
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

    // Two bounties — one in review with submissions to approve/reject, one freshly open.
    await upsertById(db.collection(collections.bounties), bountyIds.webhook, {
      innovationId: innovationIdHex,
      title: "Build the responder alert webhook + SMS bridge",
      description:
        "Implement the webhook that pushes verified alerts to county responders, plus an SMS fallback bridge. Provide a PR, a short demo, and a test log.",
      category: "development",
      rewardAmount: 0.75,
      rewardToken: "ETH",
      status: "in_review",
      milestoneId: milestoneIds.meshMvp.toHexString(),
      createdBy: wallets.owner,
      deadline: daysFromNow(10),
      maxSubmissions: 10,
    });
    await upsertById(db.collection(collections.bounties), bountyIds.riskMap, {
      innovationId: innovationIdHex,
      title: "Design the public wildfire risk map UI",
      description:
        "Design the public-facing wildfire risk map: live sensor coverage, alert severity layers, and a responder-friendly legend. Deliver Figma + exported assets.",
      category: "design",
      rewardAmount: 0.5,
      rewardToken: "ETH",
      status: "open",
      createdBy: wallets.owner,
      deadline: daysFromNow(21),
      maxSubmissions: 8,
    });

    // Submissions on the webhook bounty — both PENDING (ready for owner to approve/reject).
    await upsertById(db.collection(collections.bountySubmissions), submissionIds.webhookAlice, {
      bountyId: bountyIds.webhook.toHexString(),
      innovationId: innovationIdHex,
      contributorWallet: wallets.alice,
      description:
        "Implemented the webhook with retry + HMAC signature verification and an SMS fallback via a pluggable provider. PR, demo video, and a passing test log are linked.",
      evidenceLinks: ["https://github.com/example/aerowatch/pull/87", "https://demo.example.org/aerowatch-webhook"],
      ipfsHashes: ["bafybeiaerowebhookevidence"],
      status: "pending",
      submittedAt: now,
    });
    await upsertById(db.collection(collections.bountySubmissions), submissionIds.webhookErin, {
      bountyId: bountyIds.webhook.toHexString(),
      innovationId: innovationIdHex,
      contributorWallet: wallets.erin,
      description:
        "Alternative implementation focused on delivery guarantees: durable queue + dead-letter handling, with an SMS bridge. Includes load-test results.",
      evidenceLinks: ["https://github.com/example/aerowatch/pull/91"],
      ipfsHashes: [],
      status: "pending",
      submittedAt: now,
    });

    console.log(`Seeded LIVE demo project into ${dbName}.`);
    console.log(`Owner wallet:   ${wallets.owner}`);
    console.log(`Innovation id:  ${innovationIdHex} (on-chain #50, status active)`);
    console.log("Demo URLs:");
    console.log(`  Project:        /innovation/${innovationIdHex}`);
    console.log(`  Bounties tab:   /innovation/${innovationIdHex}/bounties`);
    console.log(`  Hypercert:      /hypercertificate/${innovationIdHex}`);
    console.log(`  Marketplace:    /bounties`);
    console.log("Awaiting owner review: 2 checkpoint proposals (pending) + 2 bounty submissions (pending).");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
