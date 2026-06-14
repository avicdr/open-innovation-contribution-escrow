import { z } from "zod";
import { txHashSchema } from "@/domain/funding/schemas";

export const contractEventNameSchema = z.enum([
  "InnovationRegistered",
  "ContributionRegistered",
  "ProofAnchored",
  "ContributionScoreUpdated",
  "FundsDeposited",
  "MilestoneCreated",
  "MilestoneApproved",
  "RewardsDistributed",
]);

export const recordContractEventSchema = z.object({
  chainId: z.number().int().positive(),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  eventName: contractEventNameSchema,
  txHash: txHashSchema,
  blockNumber: z.number().int().nonnegative(),
  logIndex: z.number().int().nonnegative(),
  removed: z.boolean().default(false),
  args: z.record(z.unknown()),
});

export const recordContractEventsSchema = z.object({
  events: z.array(recordContractEventSchema).min(1).max(500),
});

export type RecordContractEventInput = z.infer<typeof recordContractEventSchema>;

export type ContractEventDocument = RecordContractEventInput & {
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
