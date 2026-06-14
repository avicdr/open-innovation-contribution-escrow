export const simulationSteps = [
  "CREATE_INNOVATION",
  "COPILOT_ANALYSIS",
  "CONTRIBUTORS_JOIN",
  "CONTRIBUTIONS",
  "AI_EVALUATION",
  "VALIDATION",
  "FUNDING",
  "MILESTONE_APPROVAL",
  "REWARD_DISTRIBUTION",
  "HYPERCERTIFICATE_GENERATION",
  "DNA_GRAPH_EXPANSION",
  "COMPLETE",
] as const;

export type SimulationStep = (typeof simulationSteps)[number];

/** Which part of the stack performs a given action — used to colour-code detail steps. */
export type SimulationLayer = "User" | "Backend" | "AI" | "On-Chain" | "Indexer";

export type SimulationDetail = {
  readonly layer: SimulationLayer;
  readonly text: string;
};

export type SimulationMetric = {
  readonly label: string;
  readonly value: string;
};

export type SimulationPayload = {
  readonly label: string;
  readonly code: string;
};

export type SimulationFrame = {
  readonly step: SimulationStep;
  readonly title: string;
  readonly progress: number;
  readonly actor: string;
  /** One-line tagline shown under the title. */
  readonly summary: string;
  /** Plain-language paragraph describing exactly what happens this step. */
  readonly explanation: string;
  /** What the actor concretely does. */
  readonly action: string;
  /** The outcome of the step. */
  readonly result: string;
  readonly route: string;
  /** Stack-by-stack breakdown of what executes, tagged by layer. */
  readonly details: readonly SimulationDetail[];
  /** Concrete call / data sample shown in a code block. */
  readonly payload?: SimulationPayload;
  /** Key numbers that change at this step. */
  readonly metrics: readonly SimulationMetric[];
  readonly systemEvents: readonly string[];
};

export const simulationFrames: readonly SimulationFrame[] = [
  {
    step: "CREATE_INNOVATION",
    title: "Create Innovation",
    progress: 10,
    actor: "Founder",
    summary: "A founder registers a new innovation and its verifiable metadata.",
    explanation:
      "The founder submits the idea through the create form. OICE validates it, writes a MongoDB read-model document, pins the descriptive metadata to IPFS, and prepares an on-chain registration so the project gets a tamper-proof identity.",
    action: "Fills the create form (title, category, summary, tags) and submits the innovation.",
    result: "Innovation document created and metadata hash + URI prepared for registerInnovation().",
    route: "/innovation/create",
    details: [
      { layer: "User", text: "Submits the create form at /innovation/create with title, category, summary, and tags." },
      {
        layer: "Backend",
        text: "Zod validates the payload, then createInnovation() inserts a document into the innovations collection (creatorWalletAddress stored lowercased).",
      },
      { layer: "Backend", text: "Project metadata is serialized and pinned to IPFS, producing a metadataUri and a keccak256 metadataHash." },
      {
        layer: "On-Chain",
        text: "registerInnovation(bytes32 metadataHash, string metadataUri) returns a uint256 innovationId and emits InnovationRegistered.",
      },
    ],
    payload: {
      label: "contract call",
      code: "registerInnovation(\n  metadataHash: 0x9f2c…a14b,\n  metadataUri:  \"ipfs://bafy…\"\n) → innovationId: 1",
    },
    metrics: [
      { label: "Execution probability", value: "—" },
      { label: "On-chain id", value: "pending" },
      { label: "Contributors", value: "0" },
    ],
    systemEvents: ["Mongo innovation document inserted", "IPFS metadata pinned (hash + URI)", "registerInnovation tx queued"],
  },
  {
    step: "COPILOT_ANALYSIS",
    title: "Copilot Analysis",
    progress: 20,
    actor: "AI Copilot · Gemini",
    summary: "Gemini produces an execution plan and a readiness forecast.",
    explanation:
      "OICE sends the copilot prompt to Gemini, which returns a structured plan: required roles, milestones, risks, opportunities, and a success probability. The response is Zod-validated before it is cached on the innovation.",
    action: "Reads the innovation description and generates a due-diligence and execution plan.",
    result: "Execution probability starts at 61% with a concrete role and milestone map.",
    route: "/api/ai/copilot",
    details: [
      { layer: "Backend", text: "POST /api/ai/copilot builds copilotPrompt(input) and calls the Gemini service." },
      { layer: "AI", text: "Gemini returns requiredRoles[], milestones[], risks[], opportunities[], and successProbability." },
      { layer: "Backend", text: "Output is parsed, Zod-validated, then attachCopilotPlanToInnovation() caches it with a generatedAt timestamp." },
    ],
    payload: {
      label: "gemini response",
      code: '{\n  "successProbability": 61,\n  "requiredRoles": ["Frontend Eng","Hydrology Researcher","Growth"],\n  "risks": ["Sparse ground-truth data"],\n  "milestones": ["Prototype","Field validation"]\n}',
    },
    metrics: [
      { label: "Execution probability", value: "61%" },
      { label: "Required roles", value: "3" },
      { label: "Confidence", value: "high" },
    ],
    systemEvents: ["Gemini prompt executed", "Structured JSON Zod-validated", "Plan cached on innovation"],
  },
  {
    step: "CONTRIBUTORS_JOIN",
    title: "Contributors Join",
    progress: 30,
    actor: "Contributors",
    summary: "Contributors discover the project and claim the open roles.",
    explanation:
      "The innovation surfaces in the Contribute marketplace alongside its Gemini role map. Engineering, research, and community contributors pick matching roles, attaching contributor nodes to the innovation network.",
    action: "Browse the marketplace, inspect missing roles, and choose roles that match their skills.",
    result: "Three contributor nodes attach to the innovation and fill the required roles.",
    route: "/contributor/projects",
    details: [
      { layer: "User", text: "Contributors browse /contributor/projects and filter by the roles a project still needs." },
      { layer: "Backend", text: "listInnovations() surfaces the project; the missing roles come from the cached copilot plan." },
      { layer: "Backend", text: "Contributor intent is captured and matched against the innovation's open roles." },
    ],
    metrics: [
      { label: "Contributors", value: "3" },
      { label: "Roles filled", value: "3 / 3" },
      { label: "Execution probability", value: "68%" },
    ],
    systemEvents: ["Project surfaced in contributor lookup", "Missing roles displayed", "Three contributor nodes attached"],
  },
  {
    step: "CONTRIBUTIONS",
    title: "Contributions Submitted",
    progress: 40,
    actor: "Contributor",
    summary: "Each contribution anchors an immutable proof on-chain.",
    explanation:
      "From mission control a contributor submits proof-backed work. OICE hashes the proof, pins the artifact to IPFS, then calls registerContribution(), which anchors a tamper-proof proof hash and returns on-chain contribution and proof ids.",
    action: "Submits proof-backed work (title, description, type, artifact) from project mission control.",
    result: "Three immutable proofs recorded, each linked to a hypercertificate.",
    route: "/innovation/665000000000000000000001",
    details: [
      { layer: "User", text: "Submits title, description, type, and a proof artifact via SubmitContributionForm." },
      { layer: "Backend", text: "keccak256(proof) produces proofHash; the artifact is pinned to IPFS to produce proofUri." },
      {
        layer: "On-Chain",
        text: "registerContribution(innovationId, proofHash, proofUri, metadataHash) returns (contributionId, proofId) and emits ContributionRegistered + ProofAnchored.",
      },
      { layer: "Backend", text: "The contribution read-model is stored with its onChainContributionId for the hypercertificate." },
    ],
    payload: {
      label: "contract call",
      code: "registerContribution(\n  innovationId: 1,\n  proofHash:    0x71a0…9c3f,\n  proofUri:     \"ipfs://bafy…\",\n  metadataHash: 0x4d8e…2bb1\n) → (contributionId: 7, proofId: 12)",
    },
    metrics: [
      { label: "Proofs anchored", value: "3" },
      { label: "Contributions", value: "3" },
      { label: "Avg impact", value: "—" },
    ],
    systemEvents: ["Proof hash anchored on-chain", "ProofAnchored event emitted", "Contribution read-model stored"],
  },
  {
    step: "AI_EVALUATION",
    title: "AI Evaluation",
    progress: 50,
    actor: "AI Evaluator · Gemini",
    summary: "Gemini scores each contribution across five dimensions.",
    explanation:
      "The contribution-analysis prompt asks Gemini to rate originality, effort, complexity, usefulness, and impact (0–100) and return a weighted overallScore with reasoning and confidence. The score is saved and then anchored on-chain via setContributionScore().",
    action: "Scores every contribution across the five documented dimensions.",
    result: "Weighted contribution score reaches 87 and is written on-chain.",
    route: "/api/ai/analyze-contribution",
    details: [
      { layer: "Backend", text: "POST /api/ai/analyze-contribution builds contributionAnalysisPrompt(input)." },
      { layer: "AI", text: "Gemini returns originality, effort, complexity, usefulness, impact, overallScore, reasoning, confidence." },
      { layer: "Backend", text: "Result is Zod-validated; impactScore and aiScore are saved on the contribution document." },
      { layer: "On-Chain", text: "setContributionScore(contributionId, uint96 score) anchors the score and emits ContributionScoreUpdated." },
    ],
    payload: {
      label: "gemini score",
      code: '{\n  "originality": 88, "effort": 82, "complexity": 91,\n  "usefulness": 86, "impact": 90,\n  "overallScore": 87, "confidence": 0.9\n}',
    },
    metrics: [
      { label: "Top score", value: "87" },
      { label: "Dimensions", value: "5" },
      { label: "Avg impact", value: "82" },
    ],
    systemEvents: ["Five-dimension evaluation returned", "Score Zod-validated and saved", "setContributionScore tx anchored"],
  },
  {
    step: "VALIDATION",
    title: "Community Validation",
    progress: 60,
    actor: "Validators",
    summary: "Validators inspect proof trails and confirm impact.",
    explanation:
      "Validators open each contribution's proof URI and its on-chain proof hash, verify the work is genuine, and confirm impact. Community confidence blends with the AI score to harden the basis used for rewards.",
    action: "Review proof trails and on-chain ProofAnchored records, then confirm contribution quality.",
    result: "Community confidence increases reward certainty.",
    route: "/innovation/665000000000000000000001",
    details: [
      { layer: "User", text: "Validators review the proofUri artifacts against the on-chain ProofAnchored records." },
      { layer: "Backend", text: "Validation records are created and the community score is blended with the AI score." },
      { layer: "Backend", text: "Each contributor's reputation signal is updated." },
    ],
    metrics: [
      { label: "Validated", value: "3 / 3" },
      { label: "Confidence", value: "high" },
      { label: "Execution probability", value: "79%" },
    ],
    systemEvents: ["Proof trails verified", "Validation records created", "Reputation updated"],
  },
  {
    step: "FUNDING",
    title: "Funding",
    progress: 70,
    actor: "Sponsor",
    summary: "A sponsor escrows 1 ETH against the innovation.",
    explanation:
      "The sponsor calls depositFunds() with ETH, locking capital inside the escrow contract. The contract adds the value to innovation.totalFunds and emits FundsDeposited, which the indexer turns into a funding read-model row.",
    action: "Deposits ETH into the innovation escrow pool from the funder panel.",
    result: "A funding edge activates between the sponsor and the innovation.",
    route: "contract:depositFunds",
    details: [
      { layer: "User", text: "The sponsor enters an amount in the funder panel and confirms the wallet transaction." },
      {
        layer: "On-Chain",
        text: "depositFunds(uint256 innovationId) payable adds msg.value to innovation.totalFunds and emits FundsDeposited.",
      },
      { layer: "Indexer", text: "FundsDeposited is picked up via /api/events/contract and written into the fundingEvents collection." },
    ],
    payload: {
      label: "contract call",
      code: "depositFunds{ value: 1.0 ETH }(innovationId: 1)\n→ emits FundsDeposited(\n    innovationId: 1, sponsor: 0x…, amount: 1e18\n  )",
    },
    metrics: [
      { label: "Escrow balance", value: "1.0 ETH" },
      { label: "Funding events", value: "1" },
      { label: "Capital efficiency", value: "+17%" },
    ],
    systemEvents: ["Escrow deposit tx confirmed", "FundsDeposited indexed", "Funding edge activated in graph"],
  },
  {
    step: "MILESTONE_APPROVAL",
    title: "Milestone Approval",
    progress: 80,
    actor: "Project Owner",
    summary: "The owner approves delivery, opening the on-chain reward gate.",
    explanation:
      "After reviewing the delivery evidence, the project owner calls approveMilestone(). This sets innovation.milestoneApproved = true — the on-chain gate that distributeRewards() requires before any funds are allowed to move.",
    action: "Approves the milestone after inspecting delivery evidence.",
    result: "Escrow becomes eligible for reward distribution.",
    route: "contract:approveMilestone",
    details: [
      { layer: "User", text: "The owner inspects the contributor checkpoint and approves it." },
      {
        layer: "Backend",
        text: "POST /api/milestone/proposal/review records the decision; /api/milestone/create promotes it to an official milestone.",
      },
      { layer: "On-Chain", text: "approveMilestone(...) flips innovation.milestoneApproved = true and emits MilestoneApproved." },
    ],
    payload: {
      label: "contract call",
      code: "approveMilestone(innovationId: 1, milestoneId: 1)\n→ innovation.milestoneApproved = true\n→ emits MilestoneApproved",
    },
    metrics: [
      { label: "Milestone", value: "approved" },
      { label: "Reward gate", value: "open" },
      { label: "Execution probability", value: "88%" },
    ],
    systemEvents: ["Checkpoint approved by owner", "milestoneApproved set on-chain", "Reward release enabled"],
  },
  {
    step: "REWARD_DISTRIBUTION",
    title: "Reward Distribution",
    progress: 90,
    actor: "Escrow Contract",
    summary: "The owner selects a reward pool, then escrow splits that pool by on-chain contribution score.",
    explanation:
      "distributeRewards() takes the owner-selected rewardAmount and recomputes every payout as rewardAmount × score / totalScore directly inside the contract. The call reverts unless the milestone is approved, the caller is the innovation owner, and the amount fits the unlocked escrow. For the demo, scores of 50 / 30 / 20 over a 0.6 ETH reward pool pay 0.3 / 0.18 / 0.12 ETH.",
    action: "Distributes the selected reward pool proportionally by contribution score and transfers ETH to each wallet.",
    result: "0.3 ETH, 0.18 ETH, and 0.12 ETH are paid to the three contributors.",
    route: "contract:distributeRewards",
    details: [
      { layer: "User", text: "The innovation owner chooses how much unlocked escrow to release for this reward round." },
      { layer: "On-Chain", text: "distributeRewards(innovationId, contributionIds, rewardAmount) runs under PROJECT_OWNER_ROLE with nonReentrant." },
      { layer: "On-Chain", text: "Requires innovation.milestoneApproved, then computes payout_i = rewardAmount × score_i / Σ score." },
      { layer: "On-Chain", text: "ETH is transferred to each contributor wallet, undistributed escrow stays available, and RewardsDistributed is emitted." },
      { layer: "Indexer", text: "RewardsDistributed is indexed into the rewards collection and reward edges are added to the DNA graph." },
    ],
    payload: {
      label: "on-chain formula",
      code: "payout_i = rewardAmount * score_i / totalScore\n\n0.6 ETH over scores [50, 30, 20]\n→ [0.3 ETH, 0.18 ETH, 0.12 ETH]",
    },
    metrics: [
      { label: "Distributed", value: "0.6 ETH" },
      { label: "Recipients", value: "3" },
      { label: "Largest share", value: "0.3 ETH" },
    ],
    systemEvents: ["distributeRewards tx executed", "Per-wallet payouts transferred", "Reward edges added to graph"],
  },
  {
    step: "HYPERCERTIFICATE_GENERATION",
    title: "Hypercertificate Generation",
    progress: 95,
    actor: "Hypercertificate Engine",
    summary: "OICE compiles a verifiable lifecycle hypercertificate.",
    explanation:
      "getHypercertificate() aggregates the innovation, its anchored contributions, funding events, reward distributions, and AI analytics into one shareable profile. Proof coverage shows what fraction of contributions are anchored on-chain.",
    action: "Builds a shareable lifecycle profile for the innovation.",
    result: "The Innovation Hypercertificate is ready with 100% proof coverage.",
    route: "/hypercertificate/665000000000000000000001",
    details: [
      { layer: "Backend", text: "getHypercertificate(innovationId) joins innovation + contributions + fundingEvents + rewards." },
      { layer: "Backend", text: "Analytics are computed: contributionCount, averageImpact, and anchoredProofCount." },
      { layer: "User", text: "The hypercertificate renders at /hypercertificate/{id} with proof coverage and network position." },
    ],
    metrics: [
      { label: "Impact score", value: "82" },
      { label: "Proof coverage", value: "100%" },
      { label: "Rewards earned", value: "1.0 ETH" },
    ],
    systemEvents: ["Proofs aggregated", "Funding and rewards summarized", "AI summary attached"],
  },
  {
    step: "DNA_GRAPH_EXPANSION",
    title: "DNA Graph Expansion",
    progress: 100,
    actor: "DNA Graph",
    summary: "The full value network renders as one inspectable graph.",
    explanation:
      "buildProjectGraph() assembles contributor → contribution → idea → funding / milestone → reward into a layered DNA graph. Every node is backed by a proof, score, transaction, or event, so value flow is fully traceable.",
    action: "Expands the full project network with contributors, funding, milestones, and rewards.",
    result: "All value flows are visible and inspectable.",
    route: "/innovation/665000000000000000000001",
    details: [
      { layer: "Backend", text: "buildProjectGraph() maps every entity to typed nodes and edges across five layers." },
      { layer: "User", text: "The layered layout renders contributors, contributions, funding, milestones, and rewards left-to-right." },
      { layer: "On-Chain", text: "Each node links back to its on-chain proof, transaction, or event." },
    ],
    metrics: [
      { label: "Graph nodes", value: "10" },
      { label: "Edge types", value: "5" },
      { label: "Traceable flows", value: "100%" },
    ],
    systemEvents: ["Graph nodes expanded", "Flow edges animated", "Timeline replay ready"],
  },
  {
    step: "COMPLETE",
    title: "Innovation Coordinated",
    progress: 100,
    actor: "OICE",
    summary: "A full innovation lifecycle, coordinated end-to-end.",
    explanation:
      "Ethereum provided trust through anchored proofs, escrow, and score-weighted payouts. Gemini provided intelligence through planning and evaluation. OICE coordinated the loop from idea to rewarded impact — every step independently verifiable.",
    action: "Completes the innovation coordination loop.",
    result: "Lifecycle complete and fully replayable.",
    route: "/hypercertificate/665000000000000000000001",
    details: [
      { layer: "On-Chain", text: "1 innovation registered, 3 proofs anchored, 1 ETH escrowed and distributed by score." },
      { layer: "AI", text: "1 execution plan and 3 contribution evaluations generated by Gemini." },
      { layer: "Backend", text: "1 hypercertificate generated; the full graph is indexed and replayable." },
    ],
    metrics: [
      { label: "Contributors", value: "3" },
      { label: "ETH distributed", value: "1.0" },
      { label: "hypercertificates", value: "1" },
    ],
    systemEvents: ["3 contributors coordinated", "1 ETH distributed by score", "1 hypercertificate generated"],
  },
];

export function nextFrameIndex(index: number) {
  return Math.min(index + 1, simulationFrames.length - 1);
}

export function previousFrameIndex(index: number) {
  return Math.max(index - 1, 0);
}
