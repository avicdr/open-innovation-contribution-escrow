import { z } from "zod";

const serverEnvSchema = z.object({
  MONGODB_URI: z.string().min(1).optional(),
  MONGODB_DB: z.string().min(1).default("oice"),
  GEMINI_API_KEY: z.string().min(1).optional(),
  PINATA_JWT: z.string().min(1).optional(),
  BASE_SEPOLIA_RPC_URL: z.string().url().optional(),
  CONTRACT_PRIVATE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_INNOVATION_ESCROW_ADDRESS: z.string().min(1).optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number().default(84532),
  NEXT_PUBLIC_INNOVATION_ESCROW_ADDRESS: z.string().min(1).optional(),
  // When "true", the funder panel simulates deposits (no wallet/contract) for UI demos.
  NEXT_PUBLIC_DEMO_FUNDING: z.enum(["true", "false"]).optional(),
});

export const serverEnv = serverEnvSchema.parse(process.env);
export const clientEnv = clientEnvSchema.parse(process.env);

export function requireServerEnv<K extends keyof typeof serverEnv>(key: K): NonNullable<(typeof serverEnv)[K]> {
  const value = serverEnv[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value as NonNullable<(typeof serverEnv)[K]>;
}
