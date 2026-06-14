import { ObjectId } from "mongodb";
import type { CopilotData } from "@/domain/ai/schemas";
import type { CreateInnovationInput, DeleteInnovationInput, InnovationDocument } from "@/domain/innovation/schemas";
import { parseObjectId } from "@/lib/utils/object-id";
import { collections } from "@/services/database/collections";
import { getDatabase } from "@/services/database/mongodb";

type StoredInnovation = InnovationDocument & {
  readonly _id: ObjectId;
};

export type InnovationDto = Omit<InnovationDocument, "createdAt" | "updatedAt" | "aiCopilot"> & {
  readonly id: string;
  readonly aiCopilot?: Omit<NonNullable<InnovationDocument["aiCopilot"]>, "generatedAt"> & {
    readonly generatedAt: string;
  };
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DeleteInnovationResult =
  | { readonly deleted: true }
  | {
      readonly deleted: false;
      readonly code: "NOT_FOUND" | "FORBIDDEN" | "NOT_FRESH";
      readonly message: string;
      readonly blockers?: readonly string[];
    };

function toInnovationDto(document: StoredInnovation): InnovationDto {
  return {
    id: document._id.toHexString(),
    title: document.title,
    summary: document.summary,
    description: document.description,
    category: document.category,
    tags: document.tags,
    websiteUrl: document.websiteUrl,
    githubUrl: document.githubUrl,
    creatorWalletAddress: document.creatorWalletAddress,
    creatorId: document.creatorId,
    ipfsHash: document.ipfsHash,
    status: document.status,
    chainId: document.chainId,
    onChainInnovationId: document.onChainInnovationId,
    aiCopilot: document.aiCopilot
      ? {
          ...document.aiCopilot,
          generatedAt: document.aiCopilot.generatedAt.toISOString(),
        }
      : undefined,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function createInnovation(input: CreateInnovationInput): Promise<InnovationDto> {
  const db = await getDatabase();
  const now = new Date();
  const innovation: InnovationDocument = {
    ...input,
    creatorWalletAddress: input.creatorWalletAddress.toLowerCase(),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<InnovationDocument>(collections.innovations).insertOne(innovation);
  return toInnovationDto({ ...innovation, _id: result.insertedId });
}

export async function listInnovations(limit = 24): Promise<InnovationDto[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<StoredInnovation>(collections.innovations)
    .find({})
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100))
    .toArray();

  return documents.map(toInnovationDto);
}

export async function listInnovationsByCreator(creatorWalletAddress: string, limit = 50): Promise<InnovationDto[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<StoredInnovation>(collections.innovations)
    .find({ creatorWalletAddress: creatorWalletAddress.toLowerCase() })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100))
    .toArray();

  return documents.map(toInnovationDto);
}

export async function getInnovationById(id: string): Promise<InnovationDto | null> {
  const db = await getDatabase();
  const document = await db.collection<StoredInnovation>(collections.innovations).findOne({ _id: parseObjectId(id) });

  return document ? toInnovationDto(document) : null;
}

export async function attachCopilotPlanToInnovation(id: string, plan: CopilotData): Promise<InnovationDto | null> {
  const db = await getDatabase();
  const now = new Date();
  const result = await db.collection<InnovationDocument>(collections.innovations).findOneAndUpdate(
    { _id: parseObjectId(id) },
    {
      $set: {
        aiCopilot: {
          ...plan,
          generatedAt: now,
        },
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  return result ? toInnovationDto(result as StoredInnovation) : null;
}

export async function deleteFreshInnovation(id: string, input: DeleteInnovationInput): Promise<DeleteInnovationResult> {
  const db = await getDatabase();
  const _id = parseObjectId(id);
  const innovation = await db.collection<StoredInnovation>(collections.innovations).findOne({ _id });

  if (!innovation) {
    return { deleted: false, code: "NOT_FOUND", message: "Innovation was not found." };
  }

  if (innovation.creatorWalletAddress.toLowerCase() !== input.ownerAddress.toLowerCase()) {
    return { deleted: false, code: "FORBIDDEN", message: "Only the project owner can delete this project." };
  }

  const blockers = await freshDeleteBlockers(id, innovation);

  if (blockers.length > 0) {
    return {
      deleted: false,
      code: "NOT_FRESH",
      message: "Only fresh draft projects with no on-chain registration or lifecycle activity can be deleted.",
      blockers,
    };
  }

  const result = await db.collection<InnovationDocument>(collections.innovations).deleteOne({ _id });

  return result.deletedCount === 1
    ? { deleted: true }
    : { deleted: false, code: "NOT_FOUND", message: "Innovation was not found." };
}

async function freshDeleteBlockers(id: string, innovation: StoredInnovation): Promise<string[]> {
  const db = await getDatabase();
  const checks: Array<readonly [string, Promise<number>]> = [
    ["contributions", db.collection(collections.contributions).countDocuments({ innovationId: id })],
    ["proofs", db.collection(collections.proofs).countDocuments({ innovationId: id })],
    ["funding", db.collection(collections.fundingEvents).countDocuments({ innovationId: id })],
    ["milestones", db.collection(collections.milestones).countDocuments({ innovationId: id })],
    ["checkpoint proposals", db.collection(collections.milestoneProposals).countDocuments({ innovationId: id })],
    ["rewards", db.collection(collections.rewards).countDocuments({ innovationId: id })],
    ["escrow transactions", db.collection(collections.escrowTransactions).countDocuments({ innovationId: id })],
    ["contract events", db.collection(collections.contractEvents).countDocuments({ innovationId: id })],
    ["hypercertificate", db.collection(collections.hypercertificates).countDocuments({ innovationId: id })],
    ["simulation", db.collection(collections.simulations).countDocuments({ innovationId: id })],
    ["DNA graph snapshots", db.collection(collections.dnaGraphSnapshots).countDocuments({ innovationId: id })],
  ];
  const counts = await Promise.all(checks.map(async ([label, promise]) => [label, await promise] as const));
  const blockers = counts.filter(([, count]) => count > 0).map(([label]) => label);

  if (innovation.status !== "draft") {
    blockers.unshift(`status:${innovation.status}`);
  }

  if (innovation.onChainInnovationId) {
    blockers.unshift("on-chain registration");
  }

  return blockers;
}
