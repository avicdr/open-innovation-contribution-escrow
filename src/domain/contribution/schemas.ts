import { z } from "zod";

export const contributionTypeSchema = z.enum([
  "engineering",
  "research",
  "design",
  "marketing",
  "community",
  "partnerships",
  "documentation",
  "testing",
  "other",
]);

export const proofHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/);

export const createContributionSchema = z.object({
  innovationId: z.string().min(1),
  contributorWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  title: z.string().min(3).max(160),
  description: z.string().min(20).max(8000),
  type: contributionTypeSchema,
  proofUri: z.string().min(1).max(512),
  proofHash: proofHashSchema,
});

export type CreateContributionInput = z.infer<typeof createContributionSchema>;

export const recordAnchoredContributionSchema = createContributionSchema.extend({
  chainId: z.number().int().positive(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  onChainContributionId: z.string().min(1),
  onChainProofId: z.string().min(1),
  metadataHash: proofHashSchema.optional(),
});

export type RecordAnchoredContributionInput = z.infer<typeof recordAnchoredContributionSchema>;

export type ContributionScore = {
  readonly originality: number;
  readonly effort: number;
  readonly complexity: number;
  readonly usefulness: number;
  readonly impact: number;
  readonly overallScore: number;
  readonly confidence: number;
  readonly reasoning: string;
};

export type ContributionDocument = CreateContributionInput & {
  readonly contributorId?: string;
  readonly onChainContributionId?: string;
  readonly chainId?: number;
  readonly txHash?: string;
  readonly aiScore?: ContributionScore;
  readonly impactScore?: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
