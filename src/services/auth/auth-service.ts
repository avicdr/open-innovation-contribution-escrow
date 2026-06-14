import { randomBytes } from "crypto";
import { verifyMessage } from "viem";
import type { UserRole } from "@/domain/auth/schemas";
import { collections } from "@/services/database/collections";
import { getDatabase } from "@/services/database/mongodb";

const nonceTtlMs = 10 * 60 * 1000;
const sessionTtlMs = 30 * 24 * 60 * 60 * 1000;

type AuthNonceDocument = {
  readonly walletAddress: string;
  readonly nonce: string;
  readonly message: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
};

type UserDocument = {
  readonly walletAddress: string;
  readonly username?: string;
  readonly avatar?: string;
  readonly bio?: string;
  readonly roles: readonly UserRole[];
  readonly reputationScore: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type SessionDocument = {
  readonly sessionId: string;
  readonly walletAddress: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
};

function normalizeWallet(walletAddress: string) {
  return walletAddress.toLowerCase();
}

export async function createWalletNonce(walletAddress: string) {
  const db = await getDatabase();
  const normalizedWallet = normalizeWallet(walletAddress);
  const nonce = randomBytes(24).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + nonceTtlMs);
  const message = [
    "Sign in to OICE",
    "",
    "This signature proves wallet ownership. It does not authorize a transaction.",
    "",
    `Wallet: ${normalizedWallet}`,
    `Nonce: ${nonce}`,
  ].join("\n");

  await db.collection<AuthNonceDocument>(collections.authNonces).updateOne(
    { walletAddress: normalizedWallet },
    {
      $set: {
        walletAddress: normalizedWallet,
        nonce,
        message,
        expiresAt,
        createdAt: now,
      },
    },
    { upsert: true },
  );

  return { message, expiresAt: expiresAt.toISOString() };
}

export async function verifyWalletLogin(walletAddress: string, signature: `0x${string}`) {
  const db = await getDatabase();
  const normalizedWallet = normalizeWallet(walletAddress);
  const nonceRecord = await db
    .collection<AuthNonceDocument>(collections.authNonces)
    .findOne({ walletAddress: normalizedWallet });

  if (!nonceRecord || nonceRecord.expiresAt.getTime() < Date.now()) {
    throw new Error("Wallet login nonce is missing or expired.");
  }

  const valid = await verifyMessage({
    address: walletAddress as `0x${string}`,
    message: nonceRecord.message,
    signature,
  });

  if (!valid) {
    throw new Error("Wallet signature verification failed.");
  }

  const now = new Date();
  await db.collection<UserDocument>(collections.users).updateOne(
    { walletAddress: normalizedWallet },
    {
      $setOnInsert: {
        walletAddress: normalizedWallet,
        roles: ["CONTRIBUTOR"],
        reputationScore: 0,
        createdAt: now,
      },
      $set: {
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  await db.collection<AuthNonceDocument>(collections.authNonces).deleteOne({ walletAddress: normalizedWallet });

  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + sessionTtlMs);
  await db.collection<SessionDocument>(collections.sessions).insertOne({
    sessionId,
    walletAddress: normalizedWallet,
    expiresAt,
    createdAt: now,
  });

  return {
    sessionId,
    expiresAt,
    walletAddress: normalizedWallet,
  };
}

export async function getSessionWallet(sessionId?: string): Promise<string | null> {
  if (!sessionId) {
    return null;
  }

  const db = await getDatabase();
  const session = await db.collection<SessionDocument>(collections.sessions).findOne({ sessionId });

  if (!session || session.expiresAt.getTime() < Date.now()) {
    if (session) {
      await db.collection<SessionDocument>(collections.sessions).deleteOne({ sessionId });
    }

    return null;
  }

  return session.walletAddress;
}
