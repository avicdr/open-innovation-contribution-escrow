import type { RecordRewardDistributionInput, RewardDocument } from "@/domain/reward/schemas";
import { parseObjectId } from "@/lib/utils/object-id";
import { collections } from "@/services/database/collections";
import { getMongoClient } from "@/services/database/mongodb";
import { serverEnv } from "@/lib/config/env";

type StoredReward = RewardDocument & {
  readonly _id: {
    toHexString(): string;
  };
};

export type RewardDto = Omit<RewardDocument, "createdAt"> & {
  readonly id: string;
  readonly createdAt: string;
};

function toRewardDto(document: StoredReward): RewardDto {
  return {
    id: document._id.toHexString(),
    innovationId: document.innovationId,
    milestoneId: document.milestoneId,
    contributionId: document.contributionId,
    walletAddress: document.walletAddress,
    amountWei: document.amountWei,
    score: document.score,
    distributorAddress: document.distributorAddress,
    chainId: document.chainId,
    txHash: document.txHash,
    blockNumber: document.blockNumber,
    createdAt: document.createdAt.toISOString(),
  };
}

export async function recordRewardDistribution(input: RecordRewardDistributionInput): Promise<RewardDto[]> {
  const client = await getMongoClient();
  const db = client.db(serverEnv.MONGODB_DB);
  const now = new Date();
  const rewards: RewardDocument[] = input.recipients.map((recipient) => ({
    innovationId: input.innovationId,
    milestoneId: input.milestoneId,
    contributionId: recipient.contributionId,
    walletAddress: recipient.walletAddress.toLowerCase(),
    amountWei: recipient.amountWei,
    score: recipient.score,
    distributorAddress: input.distributorAddress.toLowerCase(),
    chainId: input.chainId,
    txHash: input.txHash.toLowerCase(),
    blockNumber: input.blockNumber,
    createdAt: now,
  }));

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await db.collection<RewardDocument>(collections.rewards).insertMany(rewards, { session });

      if (input.milestoneId) {
        await db.collection(collections.milestones).updateOne(
          { _id: parseObjectId(input.milestoneId) },
          {
            $set: {
              status: "released",
              updatedAt: now,
            },
          },
          { session },
        );
      }
    });
  } finally {
    await session.endSession();
  }

  return listRewardsForInnovation(input.innovationId);
}

export async function listRewardsForInnovation(innovationId: string): Promise<RewardDto[]> {
  const client = await getMongoClient();
  const db = client.db(serverEnv.MONGODB_DB);
  const documents = await db
    .collection<StoredReward>(collections.rewards)
    .find({ innovationId })
    .sort({ createdAt: -1 })
    .toArray();

  return documents.map(toRewardDto);
}
