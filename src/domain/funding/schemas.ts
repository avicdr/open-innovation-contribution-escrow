import { z } from "zod";
import { walletAddressSchema } from "@/domain/auth/schemas";

export const txHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/);

export const recordFundingSchema = z.object({
  innovationId: z.string().min(1),
  sponsorAddress: walletAddressSchema,
  amountWei: z.string().regex(/^[1-9][0-9]*$/),
  chainId: z.number().int().positive(),
  txHash: txHashSchema,
  blockNumber: z.number().int().nonnegative().optional(),
});

export type RecordFundingInput = z.infer<typeof recordFundingSchema>;

export type FundingEventDocument = {
  readonly innovationId: string;
  readonly sponsorAddress: string;
  readonly amountWei: string;
  readonly chainId: number;
  readonly txHash: string;
  readonly blockNumber?: number;
  readonly createdAt: Date;
};
