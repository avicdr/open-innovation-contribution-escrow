import type {
  ApproveMilestoneInput,
  CreateMilestoneInput,
  MilestoneDocument,
  MilestoneProposalDocument,
  ProposeMilestoneInput,
  ReviewMilestoneProposalInput,
} from "@/domain/milestone/schemas";
import { parseObjectId } from "@/lib/utils/object-id";
import { collections } from "@/services/database/collections";
import { getDatabase } from "@/services/database/mongodb";

type StoredMilestone = MilestoneDocument & {
  readonly _id: {
    toHexString(): string;
  };
};

type StoredMilestoneProposal = MilestoneProposalDocument & {
  readonly _id: {
    toHexString(): string;
  };
};

export type MilestoneDto = Omit<MilestoneDocument, "createdAt" | "updatedAt" | "targetDate" | "approvedAt"> & {
  readonly id: string;
  readonly targetDate?: string;
  readonly approvedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MilestoneProposalDto = Omit<
  MilestoneProposalDocument,
  "createdAt" | "updatedAt" | "targetDate" | "reviewedAt"
> & {
  readonly id: string;
  readonly targetDate?: string;
  readonly reviewedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function toMilestoneDto(document: StoredMilestone): MilestoneDto {
  return {
    id: document._id.toHexString(),
    innovationId: document.innovationId,
    title: document.title,
    description: document.description,
    status: document.status,
    targetDate: document.targetDate?.toISOString(),
    approverAddress: document.approverAddress,
    chainId: document.chainId,
    txHash: document.txHash,
    blockNumber: document.blockNumber,
    approvedAt: document.approvedAt?.toISOString(),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

function toMilestoneProposalDto(document: StoredMilestoneProposal): MilestoneProposalDto {
  return {
    id: document._id.toHexString(),
    innovationId: document.innovationId,
    proposerAddress: document.proposerAddress,
    title: document.title,
    description: document.description,
    status: document.status,
    targetDate: document.targetDate?.toISOString(),
    reviewerAddress: document.reviewerAddress,
    feedback: document.feedback,
    reviewedAt: document.reviewedAt?.toISOString(),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function proposeMilestone(input: ProposeMilestoneInput): Promise<MilestoneProposalDto> {
  const db = await getDatabase();
  const now = new Date();
  const document: MilestoneProposalDocument = {
    innovationId: input.innovationId,
    proposerAddress: input.proposerAddress.toLowerCase(),
    title: input.title,
    description: input.description,
    status: "PENDING",
    targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<MilestoneProposalDocument>(collections.milestoneProposals).insertOne(document);
  return toMilestoneProposalDto({ ...document, _id: result.insertedId });
}

export async function reviewMilestoneProposal(
  input: ReviewMilestoneProposalInput,
): Promise<MilestoneProposalDto | null> {
  const db = await getDatabase();
  const now = new Date();
  const result = await db.collection<MilestoneProposalDocument>(collections.milestoneProposals).findOneAndUpdate(
    { _id: parseObjectId(input.proposalId), status: "PENDING" },
    {
      $set: {
        status: input.decision,
        reviewerAddress: input.reviewerAddress.toLowerCase(),
        feedback: input.feedback,
        reviewedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  return result ? toMilestoneProposalDto(result as StoredMilestoneProposal) : null;
}

export async function getMilestoneProposalById(id: string): Promise<MilestoneProposalDto | null> {
  const db = await getDatabase();
  const document = await db
    .collection<StoredMilestoneProposal>(collections.milestoneProposals)
    .findOne({ _id: parseObjectId(id) });

  return document ? toMilestoneProposalDto(document) : null;
}

export async function createMilestone(input: CreateMilestoneInput): Promise<MilestoneDto> {
  const db = await getDatabase();
  if (input.acceptedProposalId) {
    const proposal = await db.collection<MilestoneProposalDocument>(collections.milestoneProposals).findOne({
      _id: parseObjectId(input.acceptedProposalId),
      innovationId: input.innovationId,
      status: "APPROVED",
    });

    if (!proposal) {
      throw new Error("Official milestones must originate from an approved proposal.");
    }
  }

  const now = new Date();
  const document: MilestoneDocument = {
    innovationId: input.innovationId,
    title: input.title,
    description: input.description,
    status: "planned",
    targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<MilestoneDocument>(collections.milestones).insertOne(document);
  return toMilestoneDto({ ...document, _id: result.insertedId });
}

export async function approveMilestone(input: ApproveMilestoneInput): Promise<MilestoneDto | null> {
  const db = await getDatabase();
  const now = new Date();
  const result = await db.collection<MilestoneDocument>(collections.milestones).findOneAndUpdate(
    { _id: parseObjectId(input.milestoneId) },
    {
      $set: {
        status: "approved",
        approverAddress: input.approverAddress.toLowerCase(),
        chainId: input.chainId,
        txHash: input.txHash.toLowerCase(),
        blockNumber: input.blockNumber,
        approvedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  return result ? toMilestoneDto(result as StoredMilestone) : null;
}

export async function listMilestonesForInnovation(innovationId: string): Promise<MilestoneDto[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<StoredMilestone>(collections.milestones)
    .find({ innovationId })
    .sort({ createdAt: 1 })
    .toArray();

  return documents.map(toMilestoneDto);
}

export async function listMilestoneProposalsForInnovation(innovationId: string): Promise<MilestoneProposalDto[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<StoredMilestoneProposal>(collections.milestoneProposals)
    .find({ innovationId })
    .sort({ createdAt: -1 })
    .toArray();

  return documents.map(toMilestoneProposalDto);
}
