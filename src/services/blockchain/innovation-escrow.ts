import { baseSepolia } from "viem/chains";

export const supportedChain = baseSepolia;

// Read NEXT_PUBLIC_* via direct static references so Next inlines them into the
// client bundle (parsing the whole process.env object does not get inlined,
// which causes server/client mismatches for client components).
export const innovationEscrowAddress = process.env.NEXT_PUBLIC_INNOVATION_ESCROW_ADDRESS;

/** Demo mode: the funder panel simulates deposits without a wallet or contract. */
export const demoFundingEnabled = process.env.NEXT_PUBLIC_DEMO_FUNDING === "true";

export const innovationEscrowAbi = [
  {
    type: "function",
    name: "registerInnovation",
    stateMutability: "nonpayable",
    inputs: [
      { name: "metadataHash", type: "bytes32" },
      { name: "metadataUri", type: "string" },
    ],
    outputs: [{ name: "innovationId", type: "uint256" }],
  },
  {
    type: "function",
    name: "registerContribution",
    stateMutability: "nonpayable",
    inputs: [
      { name: "innovationId", type: "uint256" },
      { name: "proofHash", type: "bytes32" },
      { name: "proofUri", type: "string" },
      { name: "metadataHash", type: "bytes32" },
    ],
    outputs: [
      { name: "contributionId", type: "uint256" },
      { name: "proofId", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "setContributionScore",
    stateMutability: "nonpayable",
    inputs: [
      { name: "contributionId", type: "uint256" },
      { name: "score", type: "uint96" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "depositFunds",
    stateMutability: "payable",
    inputs: [{ name: "innovationId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "createMilestone",
    stateMutability: "nonpayable",
    inputs: [
      { name: "innovationId", type: "uint256" },
      { name: "metadataHash", type: "bytes32" },
      { name: "metadataUri", type: "string" },
    ],
    outputs: [{ name: "milestoneId", type: "uint256" }],
  },
  {
    type: "function",
    name: "approveMilestone",
    stateMutability: "nonpayable",
    inputs: [{ name: "innovationId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "calculateRewards",
    stateMutability: "view",
    inputs: [
      { name: "innovationId", type: "uint256" },
      { name: "contributionIds", type: "uint256[]" },
      { name: "rewardAmount", type: "uint256" },
    ],
    outputs: [
      { name: "payouts", type: "uint256[]" },
      { name: "totalScore", type: "uint256" },
      { name: "escrowPool", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "releaseFunds",
    stateMutability: "nonpayable",
    inputs: [
      { name: "innovationId", type: "uint256" },
      { name: "contributionIds", type: "uint256[]" },
      { name: "rewardAmount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "distributeRewards",
    stateMutability: "nonpayable",
    inputs: [
      { name: "innovationId", type: "uint256" },
      { name: "contributionIds", type: "uint256[]" },
      { name: "rewardAmount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "ProofAnchored",
    inputs: [
      { name: "proofId", type: "uint256", indexed: true },
      { name: "innovationId", type: "uint256", indexed: true },
      { name: "contributionId", type: "uint256", indexed: true },
      { name: "contributor", type: "address", indexed: false },
      { name: "proofHash", type: "bytes32", indexed: false },
      { name: "proofUri", type: "string", indexed: false },
      { name: "metadataHash", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "FundsDeposited",
    inputs: [
      { name: "innovationId", type: "uint256", indexed: true },
      { name: "sponsor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MilestoneCreated",
    inputs: [
      { name: "milestoneId", type: "uint256", indexed: true },
      { name: "innovationId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "metadataHash", type: "bytes32", indexed: false },
      { name: "metadataUri", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MilestoneApproved",
    inputs: [
      { name: "innovationId", type: "uint256", indexed: true },
      { name: "approver", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "RewardsDistributed",
    inputs: [
      { name: "innovationId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "contributionCount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "function",
    name: "createBounty",
    stateMutability: "nonpayable",
    inputs: [
      { name: "innovationId", type: "uint256" },
      { name: "reward", type: "uint256" },
      { name: "metadataHash", type: "bytes32" },
    ],
    outputs: [{ name: "bountyId", type: "uint256" }],
  },
  {
    type: "function",
    name: "approveSubmission",
    stateMutability: "nonpayable",
    inputs: [
      { name: "bountyId", type: "uint256" },
      { name: "contributor", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "releaseBountyReward",
    stateMutability: "nonpayable",
    inputs: [{ name: "bountyId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelBounty",
    stateMutability: "nonpayable",
    inputs: [{ name: "bountyId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "event",
    name: "BountyCreated",
    inputs: [
      { name: "bountyId", type: "uint256", indexed: true },
      { name: "innovationId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "reward", type: "uint256", indexed: false },
      { name: "metadataHash", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SubmissionApproved",
    inputs: [
      { name: "bountyId", type: "uint256", indexed: true },
      { name: "innovationId", type: "uint256", indexed: true },
      { name: "contributor", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "RewardReleased",
    inputs: [
      { name: "bountyId", type: "uint256", indexed: true },
      { name: "contributor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BountyCancelled",
    inputs: [
      { name: "bountyId", type: "uint256", indexed: true },
      { name: "innovationId", type: "uint256", indexed: true },
    ],
  },
] as const;
