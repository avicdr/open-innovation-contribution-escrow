import { z } from "zod";
import { walletAddressSchema } from "@/domain/auth/schemas";
import { txHashSchema } from "@/domain/funding/schemas";

export const rewardRecipientSchema = z.object({
  contributionId: z.string().min(1),
  walletAddress: walletAddressSchema,
  amountWei: z.string().regex(/^[0-9]+$/),
  score: z.number().int().min(0).max(10_000),
});

export const recordRewardDistributionSchema = z.object({
  innovationId: z.string().min(1),
  milestoneId: z.string().min(1).optional(),
  distributorAddress: walletAddressSchema,
  chainId: z.number().int().positive(),
  txHash: txHashSchema,
  blockNumber: z.number().int().nonnegative().optional(),
  totalAmountWei: z.string().regex(/^[1-9][0-9]*$/),
  recipients: z.array(rewardRecipientSchema).min(1).max(200),
});

export type RecordRewardDistributionInput = z.infer<typeof recordRewardDistributionSchema>;

export type RewardDocument = {
  readonly innovationId: string;
  readonly milestoneId?: string;
  readonly contributionId: string;
  readonly walletAddress: string;
  readonly amountWei: string;
  readonly score: number;
  readonly distributorAddress: string;
  readonly chainId: number;
  readonly txHash: string;
  readonly blockNumber?: number;
  readonly createdAt: Date;
};
