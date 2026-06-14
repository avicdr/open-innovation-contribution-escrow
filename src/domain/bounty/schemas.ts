import { z } from "zod";
import { walletAddressSchema } from "@/domain/auth/schemas";
import { txHashSchema } from "@/domain/funding/schemas";

export const bountyCategorySchema = z.enum([
  "design",
  "research",
  "development",
  "marketing",
  "business",
  "other",
]);

export const bountyStatusSchema = z.enum(["open", "in_review", "completed", "cancelled"]);

export const submissionStatusSchema = z.enum(["pending", "approved", "rejected"]);

export type BountyCategory = z.infer<typeof bountyCategorySchema>;
export type BountyStatus = z.infer<typeof bountyStatusSchema>;
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim().length === 0 ? undefined : value;

export const createBountySchema = z.object({
  innovationId: z.string().min(1),
  title: z.string().min(3).max(160),
  description: z.string().min(20).max(8000),
  category: bountyCategorySchema,
  // Reward expressed in whole ETH (matches the escrow's native-token deposits).
  rewardAmount: z.number().positive().max(1_000_000),
  rewardToken: z.string().min(1).max(12).default("ETH"),
  createdBy: walletAddressSchema,
  milestoneId: z.preprocess(emptyToUndefined, z.string().optional()),
  deadline: z.preprocess(emptyToUndefined, z.string().datetime().optional()),
  maxSubmissions: z.number().int().positive().max(1000).optional(),
});

export type CreateBountyInput = z.infer<typeof createBountySchema>;

export const cancelBountySchema = z.object({
  ownerAddress: walletAddressSchema,
});

export type CancelBountyInput = z.infer<typeof cancelBountySchema>;

export const createBountySubmissionSchema = z.object({
  bountyId: z.string().min(1),
  contributorWallet: walletAddressSchema,
  description: z.string().min(20).max(8000),
  evidenceLinks: z.array(z.string().url().max(512)).max(20).default([]),
  ipfsHashes: z.array(z.string().min(1).max(200)).max(20).default([]),
});

export type CreateBountySubmissionInput = z.infer<typeof createBountySubmissionSchema>;

export const reviewBountySubmissionSchema = z.object({
  submissionId: z.string().min(1),
  reviewerAddress: walletAddressSchema,
  decision: submissionStatusSchema.exclude(["pending"]),
  reviewNotes: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  // Present when an approval was settled on-chain (escrow payout).
  chainId: z.number().int().positive().optional(),
  txHash: z.preprocess(emptyToUndefined, txHashSchema.optional()),
  blockNumber: z.number().int().nonnegative().optional(),
});

export type ReviewBountySubmissionInput = z.infer<typeof reviewBountySubmissionSchema>;

export type BountyDocument = {
  readonly innovationId: string;
  readonly title: string;
  readonly description: string;
  readonly category: BountyCategory;
  readonly rewardAmount: number;
  readonly rewardToken: string;
  readonly status: BountyStatus;
  readonly milestoneId?: string;
  readonly createdBy: string;
  readonly deadline?: Date;
  readonly maxSubmissions?: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type BountySubmissionDocument = {
  readonly bountyId: string;
  readonly innovationId: string;
  readonly contributorWallet: string;
  readonly contributorId?: string;
  readonly description: string;
  readonly evidenceLinks: readonly string[];
  readonly ipfsHashes: readonly string[];
  readonly status: SubmissionStatus;
  readonly reviewNotes?: string;
  readonly reviewerAddress?: string;
  readonly rewardContributionId?: string;
  readonly chainId?: number;
  readonly txHash?: string;
  readonly blockNumber?: number;
  readonly submittedAt: Date;
  readonly reviewedAt?: Date;
  readonly updatedAt: Date;
};

/** Maps a bounty category onto the contribution type taxonomy for hypercertificate flow. */
export const bountyCategoryToContributionType: Record<
  BountyCategory,
  "engineering" | "research" | "design" | "marketing" | "partnerships" | "other"
> = {
  development: "engineering",
  research: "research",
  design: "design",
  marketing: "marketing",
  business: "partnerships",
  other: "other",
};
