import { z } from "zod";

export const walletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
export const signatureSchema = z.string().regex(/^0x[a-fA-F0-9]+$/);
export const userRoleSchema = z.enum(["PROJECT_OWNER", "CONTRIBUTOR", "VALIDATOR", "SPONSOR"]);

export const nonceRequestSchema = z.object({
  walletAddress: walletAddressSchema,
});

export const verifyWalletSchema = z.object({
  walletAddress: walletAddressSchema,
  signature: signatureSchema,
});

export type NonceRequestInput = z.infer<typeof nonceRequestSchema>;
export type VerifyWalletInput = z.infer<typeof verifyWalletSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
