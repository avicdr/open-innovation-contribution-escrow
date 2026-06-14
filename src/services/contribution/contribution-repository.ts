import { ObjectId } from "mongodb";
import type { ContributionDocument, RecordAnchoredContributionInput } from "@/domain/contribution/schemas";
import type { ProofDocument } from "@/domain/proof/schemas";
import { collections } from "@/services/database/collections";
import { getMongoClient } from "@/services/database/mongodb";
import { serverEnv } from "@/lib/config/env";

type StoredContribution = ContributionDocument & {
  readonly _id: ObjectId;
};

export type ContributionDto = Omit<ContributionDocument, "createdAt" | "updatedAt"> & {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function toContributionDto(document: StoredContribution): ContributionDto {
  return {
    id: document._id.toHexString(),
    innovationId: document.innovationId,
    contributorWalletAddress: document.contributorWalletAddress,
    contributorId: document.contributorId,
    title: document.title,
    description: document.description,
    type: document.type,
    proofUri: document.proofUri,
    proofHash: document.proofHash,
    onChainContributionId: document.onChainContributionId,
    chainId: document.chainId,
    txHash: document.txHash,
    aiScore: document.aiScore,
    impactScore: document.impactScore,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function recordAnchoredContribution(
  input: RecordAnchoredContributionInput,
): Promise<ContributionDto> {
  const client = await getMongoClient();
  const db = client.db(serverEnv.MONGODB_DB);
  const session = client.startSession();
  const now = new Date();
  const contributionId = new ObjectId();

  const contribution: ContributionDocument = {
    innovationId: input.innovationId,
    contributorWalletAddress: input.contributorWalletAddress.toLowerCase(),
    title: input.title,
    description: input.description,
    type: input.type,
    proofUri: input.proofUri,
    proofHash: input.proofHash.toLowerCase(),
    onChainContributionId: input.onChainContributionId,
    chainId: input.chainId,
    txHash: input.txHash.toLowerCase(),
    createdAt: now,
    updatedAt: now,
  };

  const proof: ProofDocument = {
    innovationId: input.innovationId,
    contributionId: contributionId.toHexString(),
    contributorWalletAddress: input.contributorWalletAddress.toLowerCase(),
    proofHash: input.proofHash.toLowerCase(),
    proofUri: input.proofUri,
    metadataHash: input.metadataHash?.toLowerCase(),
    chainId: input.chainId,
    txHash: input.txHash.toLowerCase(),
    onChainProofId: input.onChainProofId,
    anchoredAt: now,
    status: "anchored",
    createdAt: now,
    updatedAt: now,
  };

  try {
    await session.withTransaction(async () => {
      await db
        .collection<StoredContribution>(collections.contributions)
        .insertOne({ ...contribution, _id: contributionId }, { session });
      await db.collection<ProofDocument>(collections.proofs).insertOne(proof, { session });
    });
  } finally {
    await session.endSession();
  }

  return toContributionDto({ ...contribution, _id: contributionId });
}

export async function listContributionsForInnovation(innovationId: string, limit = 100): Promise<ContributionDto[]> {
  const client = await getMongoClient();
  const db = client.db(serverEnv.MONGODB_DB);
  const documents = await db
    .collection<StoredContribution>(collections.contributions)
    .find({ innovationId })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 250))
    .toArray();

  return documents.map(toContributionDto);
}
