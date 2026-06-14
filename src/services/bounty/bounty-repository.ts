import { ObjectId } from "mongodb";
import { parseEther } from "viem";
import type {
  BountyDocument,
  BountyStatus,
  BountySubmissionDocument,
  CancelBountyInput,
  CreateBountyInput,
  CreateBountySubmissionInput,
  ReviewBountySubmissionInput,
} from "@/domain/bounty/schemas";
import { bountyCategoryToContributionType } from "@/domain/bounty/schemas";
import type { ContributionDocument } from "@/domain/contribution/schemas";
import type { RewardDocument } from "@/domain/reward/schemas";
import { parseObjectId } from "@/lib/utils/object-id";
import { collections } from "@/services/database/collections";
import { getDatabase } from "@/services/database/mongodb";
import { listFundingForInnovation } from "@/services/funding/funding-repository";
import { listRewardsForInnovation } from "@/services/reward/reward-repository";

// Base Sepolia — mirrors clientEnv.NEXT_PUBLIC_CHAIN_ID default; used to stamp
// reward rows when an approval is settled in demo mode without a wallet tx.
const DEFAULT_CHAIN_ID = 84532;

type StoredBounty = BountyDocument & { readonly _id: ObjectId };
type StoredSubmission = BountySubmissionDocument & { readonly _id: ObjectId };

export type BountyDto = Omit<BountyDocument, "deadline" | "createdAt" | "updatedAt"> & {
  readonly id: string;
  readonly deadline?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly submissionCount: number;
};

export type BountySubmissionDto = Omit<BountySubmissionDocument, "submittedAt" | "reviewedAt" | "updatedAt"> & {
  readonly id: string;
  readonly submittedAt: string;
  readonly reviewedAt?: string;
  readonly updatedAt: string;
};

export type EscrowAvailability = {
  readonly totalFundingWei: string;
  readonly distributedWei: string;
  readonly committedWei: string;
  readonly availableWei: string;
  readonly freeWei: string;
};

export type BountyAnalytics = {
  readonly totalBounties: number;
  readonly completedBounties: number;
  readonly openBounties: number;
  readonly rewardsDistributedWei: string;
  readonly averageCompletionHours: number | null;
  readonly activeContributors: number;
  readonly submissionCount: number;
  readonly participationRate: number;
};

function toBountyDto(document: StoredBounty, submissionCount: number): BountyDto {
  return {
    id: document._id.toHexString(),
    innovationId: document.innovationId,
    title: document.title,
    description: document.description,
    category: document.category,
    rewardAmount: document.rewardAmount,
    rewardToken: document.rewardToken,
    status: document.status,
    milestoneId: document.milestoneId,
    createdBy: document.createdBy,
    deadline: document.deadline?.toISOString(),
    maxSubmissions: document.maxSubmissions,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    submissionCount,
  };
}

function toSubmissionDto(document: StoredSubmission): BountySubmissionDto {
  return {
    id: document._id.toHexString(),
    bountyId: document.bountyId,
    innovationId: document.innovationId,
    contributorWallet: document.contributorWallet,
    contributorId: document.contributorId,
    description: document.description,
    evidenceLinks: document.evidenceLinks,
    ipfsHashes: document.ipfsHashes,
    status: document.status,
    reviewNotes: document.reviewNotes,
    reviewerAddress: document.reviewerAddress,
    rewardContributionId: document.rewardContributionId,
    chainId: document.chainId,
    txHash: document.txHash,
    blockNumber: document.blockNumber,
    submittedAt: document.submittedAt.toISOString(),
    reviewedAt: document.reviewedAt?.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

function sumWei(values: readonly string[]) {
  return values.reduce((total, value) => {
    try {
      return total + BigInt(value);
    } catch {
      return total;
    }
  }, 0n);
}

function rewardToWei(rewardAmount: number) {
  // parseEther needs a string; cap precision to 18 decimals to stay valid.
  return parseEther(rewardAmount.toFixed(18).replace(/0+$/, "").replace(/\.$/, ""));
}

async function countSubmissions(bountyId: string): Promise<number> {
  const db = await getDatabase();
  return db.collection(collections.bountySubmissions).countDocuments({ bountyId });
}

/**
 * Escrow balance available to commit to new bounties:
 * total deposited − already distributed − rewards committed to live bounties.
 */
export async function getEscrowAvailability(innovationId: string): Promise<EscrowAvailability> {
  const db = await getDatabase();
  const [funding, rewards, liveBounties] = await Promise.all([
    listFundingForInnovation(innovationId).catch(() => []),
    listRewardsForInnovation(innovationId).catch(() => []),
    db
      .collection<StoredBounty>(collections.bounties)
      .find({ innovationId, status: { $in: ["open", "in_review"] } })
      .toArray(),
  ]);

  const totalFundingWei = sumWei(funding.map((event) => event.amountWei));
  const distributedWei = sumWei(rewards.map((reward) => reward.amountWei));
  const committedWei = liveBounties.reduce((total, bounty) => total + rewardToWei(bounty.rewardAmount), 0n);
  const availableWei = totalFundingWei > distributedWei ? totalFundingWei - distributedWei : 0n;
  const freeWei = availableWei > committedWei ? availableWei - committedWei : 0n;

  return {
    totalFundingWei: totalFundingWei.toString(),
    distributedWei: distributedWei.toString(),
    committedWei: committedWei.toString(),
    availableWei: availableWei.toString(),
    freeWei: freeWei.toString(),
  };
}

export class EscrowInsufficientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EscrowInsufficientError";
  }
}

export async function createBounty(input: CreateBountyInput): Promise<BountyDto> {
  const availability = await getEscrowAvailability(input.innovationId);
  const required = rewardToWei(input.rewardAmount);

  if (required > BigInt(availability.freeWei)) {
    throw new EscrowInsufficientError(
      "Reward exceeds the unallocated escrow balance. Fund the innovation escrow or lower the reward before creating this bounty.",
    );
  }

  const db = await getDatabase();
  const now = new Date();
  const document: BountyDocument = {
    innovationId: input.innovationId,
    title: input.title,
    description: input.description,
    category: input.category,
    rewardAmount: input.rewardAmount,
    rewardToken: input.rewardToken,
    status: "open",
    milestoneId: input.milestoneId,
    createdBy: input.createdBy.toLowerCase(),
    deadline: input.deadline ? new Date(input.deadline) : undefined,
    maxSubmissions: input.maxSubmissions,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<BountyDocument>(collections.bounties).insertOne(document);
  return toBountyDto({ ...document, _id: result.insertedId }, 0);
}

export async function getBountyById(id: string): Promise<BountyDto | null> {
  const db = await getDatabase();
  const document = await db.collection<StoredBounty>(collections.bounties).findOne({ _id: parseObjectId(id) });

  if (!document) {
    return null;
  }

  return toBountyDto(document, await countSubmissions(id));
}

async function decorateBounties(documents: readonly StoredBounty[]): Promise<BountyDto[]> {
  const counts = await Promise.all(documents.map((document) => countSubmissions(document._id.toHexString())));
  return documents.map((document, index) => toBountyDto(document, counts[index]));
}

export async function listBountiesForInnovation(innovationId: string): Promise<BountyDto[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<StoredBounty>(collections.bounties)
    .find({ innovationId })
    .sort({ createdAt: -1 })
    .toArray();

  return decorateBounties(documents);
}

export async function listBountiesByOwner(ownerAddress: string): Promise<BountyDto[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<StoredBounty>(collections.bounties)
    .find({ createdBy: ownerAddress.toLowerCase() })
    .sort({ createdAt: -1 })
    .toArray();

  return decorateBounties(documents);
}

export type ListBountiesFilter = {
  readonly category?: BountyDocument["category"];
  readonly status?: BountyStatus;
  readonly limit?: number;
};

export async function listBounties(filter: ListBountiesFilter = {}): Promise<BountyDto[]> {
  const db = await getDatabase();
  const query: Record<string, unknown> = {};

  if (filter.category) {
    query.category = filter.category;
  }

  query.status = filter.status ?? { $in: ["open", "in_review"] };

  const documents = await db
    .collection<StoredBounty>(collections.bounties)
    .find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(filter.limit ?? 60, 120))
    .toArray();

  return decorateBounties(documents);
}

export async function cancelBounty(id: string, input: CancelBountyInput): Promise<BountyDto | null> {
  const db = await getDatabase();
  const now = new Date();
  const result = await db.collection<BountyDocument>(collections.bounties).findOneAndUpdate(
    {
      _id: parseObjectId(id),
      createdBy: input.ownerAddress.toLowerCase(),
      status: { $in: ["open", "in_review"] },
    },
    { $set: { status: "cancelled", updatedAt: now } },
    { returnDocument: "after" },
  );

  return result ? toBountyDto(result as StoredBounty, await countSubmissions(id)) : null;
}

export class SubmissionRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubmissionRejectedError";
  }
}

export async function createBountySubmission(input: CreateBountySubmissionInput): Promise<BountySubmissionDto> {
  const db = await getDatabase();
  const bounty = await db.collection<StoredBounty>(collections.bounties).findOne({ _id: parseObjectId(input.bountyId) });

  if (!bounty) {
    throw new SubmissionRejectedError("This bounty no longer exists.");
  }

  if (bounty.status === "completed" || bounty.status === "cancelled") {
    throw new SubmissionRejectedError("This bounty is closed and is not accepting submissions.");
  }

  if (bounty.deadline && bounty.deadline.getTime() < Date.now()) {
    throw new SubmissionRejectedError("This bounty's deadline has passed.");
  }

  const existing = await countSubmissions(input.bountyId);

  if (bounty.maxSubmissions && existing >= bounty.maxSubmissions) {
    throw new SubmissionRejectedError("This bounty has reached its submission limit.");
  }

  const now = new Date();
  const document: BountySubmissionDocument = {
    bountyId: input.bountyId,
    innovationId: bounty.innovationId,
    contributorWallet: input.contributorWallet.toLowerCase(),
    description: input.description,
    evidenceLinks: input.evidenceLinks,
    ipfsHashes: input.ipfsHashes,
    status: "pending",
    submittedAt: now,
    updatedAt: now,
  };

  const result = await db.collection<BountySubmissionDocument>(collections.bountySubmissions).insertOne(document);

  if (bounty.status === "open") {
    await db
      .collection<BountyDocument>(collections.bounties)
      .updateOne({ _id: bounty._id }, { $set: { status: "in_review", updatedAt: now } });
  }

  return toSubmissionDto({ ...document, _id: result.insertedId });
}

export async function listSubmissionsForBounty(bountyId: string): Promise<BountySubmissionDto[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<StoredSubmission>(collections.bountySubmissions)
    .find({ bountyId })
    .sort({ submittedAt: -1 })
    .toArray();

  return documents.map(toSubmissionDto);
}

export async function listSubmissionsForInnovation(innovationId: string): Promise<BountySubmissionDto[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<StoredSubmission>(collections.bountySubmissions)
    .find({ innovationId })
    .sort({ submittedAt: -1 })
    .toArray();

  return documents.map(toSubmissionDto);
}

export async function getSubmissionById(id: string): Promise<BountySubmissionDto | null> {
  const db = await getDatabase();
  const document = await db
    .collection<StoredSubmission>(collections.bountySubmissions)
    .findOne({ _id: parseObjectId(id) });

  return document ? toSubmissionDto(document) : null;
}

export class ReviewForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewForbiddenError";
  }
}

/**
 * Owner review. On approval this records the payout: a verified contribution (so
 * the work flows into the contributor's hypercertificate), a reward row (so
 * escrow analytics stay consistent with milestone rewards), the approved
 * submission, and the completed bounty.
 *
 * "Reward released only once" is enforced by an atomic compare-and-set that
 * flips the submission pending → approved before any reward write — only the
 * first caller wins, so no replica-set transaction is required.
 */
export async function reviewBountySubmission(input: ReviewBountySubmissionInput): Promise<BountySubmissionDto | null> {
  const db = await getDatabase();
  const submission = await db
    .collection<StoredSubmission>(collections.bountySubmissions)
    .findOne({ _id: parseObjectId(input.submissionId) });

  if (!submission) {
    return null;
  }

  if (submission.status !== "pending") {
    throw new ReviewForbiddenError("This submission has already been reviewed.");
  }

  const bounty = await db
    .collection<StoredBounty>(collections.bounties)
    .findOne({ _id: parseObjectId(submission.bountyId) });

  if (!bounty) {
    throw new ReviewForbiddenError("The bounty for this submission no longer exists.");
  }

  if (bounty.createdBy.toLowerCase() !== input.reviewerAddress.toLowerCase()) {
    throw new ReviewForbiddenError("Only the innovation owner who created this bounty can review submissions.");
  }

  const now = new Date();

  if (input.decision === "rejected") {
    const rejected = await db.collection<BountySubmissionDocument>(collections.bountySubmissions).findOneAndUpdate(
      { _id: submission._id, status: "pending" },
      {
        $set: {
          status: "rejected",
          reviewerAddress: input.reviewerAddress.toLowerCase(),
          reviewNotes: input.reviewNotes,
          reviewedAt: now,
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    );

    if (!rejected) {
      throw new ReviewForbiddenError("This submission has already been reviewed.");
    }

    // If nothing else is pending, reopen the bounty for fresh submissions.
    const stillPending = await db
      .collection(collections.bountySubmissions)
      .countDocuments({ bountyId: submission.bountyId, status: "pending", _id: { $ne: submission._id } });

    if (stillPending === 0 && bounty.status === "in_review") {
      await db
        .collection<BountyDocument>(collections.bounties)
        .updateOne({ _id: bounty._id }, { $set: { status: "open", updatedAt: now } });
    }

    return toSubmissionDto(rejected as StoredSubmission);
  }

  // Approval path. The reward row needs a chain id + tx hash: when a wallet
  // settled the payout we use the real values, otherwise we derive a
  // deterministic placeholder (unique per contribution, so the rewards unique
  // index is never violated).
  const contributionId = new ObjectId();
  const rewardWei = rewardToWei(bounty.rewardAmount).toString();
  const evidenceUri = submission.evidenceLinks[0] ?? (submission.ipfsHashes[0] ? `ipfs://${submission.ipfsHashes[0]}` : "");
  const settlementChainId = input.chainId ?? DEFAULT_CHAIN_ID;
  const settlementTxHash = input.txHash ?? `0x${contributionId.toHexString().padEnd(64, "0").slice(0, 64)}`;

  // Single-document atomic claim: only the first approver proceeds to pay out.
  const claimed = await db.collection<BountySubmissionDocument>(collections.bountySubmissions).findOneAndUpdate(
    { _id: submission._id, status: "pending" },
    {
      $set: {
        status: "approved",
        reviewerAddress: input.reviewerAddress.toLowerCase(),
        reviewNotes: input.reviewNotes,
        rewardContributionId: contributionId.toHexString(),
        chainId: settlementChainId,
        txHash: settlementTxHash,
        blockNumber: input.blockNumber,
        reviewedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  if (!claimed) {
    throw new ReviewForbiddenError("This submission has already been reviewed.");
  }

  const contribution: ContributionDocument & { readonly source: string; readonly bountyId: string } = {
    innovationId: bounty.innovationId,
    contributorWalletAddress: submission.contributorWallet.toLowerCase(),
    title: bounty.title,
    description: submission.description,
    type: bountyCategoryToContributionType[bounty.category],
    proofUri: evidenceUri,
    proofHash: settlementTxHash,
    chainId: settlementChainId,
    txHash: input.txHash,
    impactScore: 0,
    source: "bounty",
    bountyId: submission.bountyId,
    createdAt: now,
    updatedAt: now,
  };

  await db
    .collection<ContributionDocument>(collections.contributions)
    .insertOne({ ...contribution, _id: contributionId } as ContributionDocument & { _id: ObjectId });

  const reward: RewardDocument = {
    innovationId: bounty.innovationId,
    milestoneId: bounty.milestoneId,
    contributionId: contributionId.toHexString(),
    walletAddress: submission.contributorWallet.toLowerCase(),
    amountWei: rewardWei,
    score: 0,
    distributorAddress: input.reviewerAddress.toLowerCase(),
    chainId: settlementChainId,
    txHash: settlementTxHash,
    blockNumber: input.blockNumber,
    createdAt: now,
  };

  await db.collection<RewardDocument>(collections.rewards).insertOne(reward);

  await db
    .collection<BountyDocument>(collections.bounties)
    .updateOne({ _id: bounty._id }, { $set: { status: "completed", updatedAt: now } });

  return toSubmissionDto(claimed as StoredSubmission);
}

export async function getBountyAnalytics(innovationId: string): Promise<BountyAnalytics> {
  const db = await getDatabase();
  const [bounties, submissions, rewards] = await Promise.all([
    db.collection<StoredBounty>(collections.bounties).find({ innovationId }).toArray(),
    db.collection<StoredSubmission>(collections.bountySubmissions).find({ innovationId }).toArray(),
    listRewardsForInnovation(innovationId).catch(() => []),
  ]);

  const completed = bounties.filter((bounty) => bounty.status === "completed");
  const completionHours = completed
    .map((bounty) => (bounty.updatedAt.getTime() - bounty.createdAt.getTime()) / 3_600_000)
    .filter((hours) => hours >= 0);
  const averageCompletionHours =
    completionHours.length === 0
      ? null
      : Math.round((completionHours.reduce((total, hours) => total + hours, 0) / completionHours.length) * 10) / 10;

  // Bounty-sourced rewards only (contributions tagged with a bountyId).
  const bountyContributionIds = new Set(
    (await db
      .collection(collections.contributions)
      .find({ innovationId, source: "bounty" })
      .project({ _id: 1 })
      .toArray()).map((doc) => (doc._id as ObjectId).toHexString()),
  );
  const rewardsDistributedWei = sumWei(
    rewards.filter((reward) => reward.contributionId && bountyContributionIds.has(reward.contributionId)).map((reward) => reward.amountWei),
  );

  const contributors = new Set(submissions.map((submission) => submission.contributorWallet));
  const approvedContributors = new Set(
    submissions.filter((submission) => submission.status === "approved").map((submission) => submission.contributorWallet),
  );

  return {
    totalBounties: bounties.length,
    completedBounties: completed.length,
    openBounties: bounties.filter((bounty) => bounty.status === "open" || bounty.status === "in_review").length,
    rewardsDistributedWei: rewardsDistributedWei.toString(),
    averageCompletionHours,
    activeContributors: contributors.size,
    submissionCount: submissions.length,
    participationRate: contributors.size === 0 ? 0 : Math.round((approvedContributors.size / contributors.size) * 100),
  };
}
