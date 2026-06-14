import { z } from "zod";
import type { CopilotData } from "@/domain/ai/schemas";
import { walletAddressSchema } from "@/domain/auth/schemas";

export const innovationStatusSchema = z.enum(["draft", "active", "funded", "completed", "archived"]);

const optionalUrlSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) {
    return undefined;
  }

  return value;
}, z.string().url().optional());

export const createInnovationSchema = z.object({
  title: z.string().min(3).max(140),
  summary: z.string().min(12).max(280),
  description: z.string().min(40).max(8000),
  category: z.string().min(2).max(80),
  tags: z.array(z.string().min(1).max(40)).max(12).default([]),
  websiteUrl: optionalUrlSchema,
  githubUrl: optionalUrlSchema,
  creatorWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  ipfsHash: z.string().min(1).optional(),
});

export type CreateInnovationInput = z.infer<typeof createInnovationSchema>;

export const deleteInnovationSchema = z.object({
  ownerAddress: walletAddressSchema,
});

export type DeleteInnovationInput = z.infer<typeof deleteInnovationSchema>;

export type InnovationDocument = CreateInnovationInput & {
  readonly creatorId?: string;
  readonly status: z.infer<typeof innovationStatusSchema>;
  readonly chainId?: number;
  readonly onChainInnovationId?: string;
  readonly aiCopilot?: CopilotData & {
    readonly generatedAt: Date;
  };
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
