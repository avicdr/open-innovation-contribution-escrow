import { z } from "zod";
import { proofHashSchema } from "@/domain/contribution/schemas";

export const proofStatusSchema = z.enum(["pending_anchor", "anchored", "anchor_failed"]);

export const anchoredProofSchema = z.object({
  innovationId: z.string().min(1),
  contributionId: z.string().min(1),
  contributorWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  proofHash: proofHashSchema,
  proofUri: z.string().min(1).max(512),
  metadataHash: proofHashSchema.optional(),
  chainId: z.number().int().positive(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  onChainProofId: z.string().min(1),
  anchoredAt: z.date(),
});

export type AnchoredProof = z.infer<typeof anchoredProofSchema>;

export type ProofDocument = AnchoredProof & {
  readonly status: z.infer<typeof proofStatusSchema>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
