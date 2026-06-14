import { z } from "zod";
import { walletAddressSchema } from "@/domain/auth/schemas";
import { txHashSchema } from "@/domain/funding/schemas";

export const milestoneStatusSchema = z.enum(["planned", "active", "approved", "released"]);
export const milestoneProposalStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const createMilestoneSchema = z.object({
  innovationId: z.string().min(1),
  title: z.string().min(3).max(160),
  description: z.string().min(12).max(4000),
  targetDate: z.string().datetime().optional(),
  acceptedProposalId: z.string().min(1),
  ownerAddress: walletAddressSchema,
});

export const proposeMilestoneSchema = z.object({
  innovationId: z.string().min(1),
  proposerAddress: walletAddressSchema,
  title: z.string().min(3).max(160),
  description: z.string().min(12).max(4000),
  targetDate: z.string().datetime().optional(),
});

export const reviewMilestoneProposalSchema = z.object({
  proposalId: z.string().min(1),
  reviewerAddress: walletAddressSchema,
  decision: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().max(2000).optional(),
});

export const approveMilestoneSchema = z.object({
  milestoneId: z.string().min(1),
  approverAddress: walletAddressSchema,
  chainId: z.number().int().positive(),
  txHash: txHashSchema,
  blockNumber: z.number().int().nonnegative().optional(),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type ProposeMilestoneInput = z.infer<typeof proposeMilestoneSchema>;
export type ReviewMilestoneProposalInput = z.infer<typeof reviewMilestoneProposalSchema>;
export type ApproveMilestoneInput = z.infer<typeof approveMilestoneSchema>;

export type MilestoneDocument = {
  readonly innovationId: string;
  readonly title: string;
  readonly description: string;
  readonly status: z.infer<typeof milestoneStatusSchema>;
  readonly targetDate?: Date;
  readonly approverAddress?: string;
  readonly chainId?: number;
  readonly txHash?: string;
  readonly blockNumber?: number;
  readonly approvedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type MilestoneProposalDocument = {
  readonly innovationId: string;
  readonly proposerAddress: string;
  readonly title: string;
  readonly description: string;
  readonly status: z.infer<typeof milestoneProposalStatusSchema>;
  readonly targetDate?: Date;
  readonly reviewerAddress?: string;
  readonly feedback?: string;
  readonly reviewedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
