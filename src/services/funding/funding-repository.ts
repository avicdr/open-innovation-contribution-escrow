import type { FundingEventDocument, RecordFundingInput } from "@/domain/funding/schemas";
import { collections } from "@/services/database/collections";
import { getDatabase } from "@/services/database/mongodb";

export type FundingEventDto = Omit<FundingEventDocument, "createdAt"> & {
  readonly id: string;
  readonly createdAt: string;
};

type StoredFundingEvent = FundingEventDocument & {
  readonly _id: {
    toHexString(): string;
  };
};

function toFundingEventDto(document: StoredFundingEvent): FundingEventDto {
  return {
    id: document._id.toHexString(),
    innovationId: document.innovationId,
    sponsorAddress: document.sponsorAddress,
    amountWei: document.amountWei,
    chainId: document.chainId,
    txHash: document.txHash,
    blockNumber: document.blockNumber,
    createdAt: document.createdAt.toISOString(),
  };
}

export async function recordFunding(input: RecordFundingInput): Promise<FundingEventDto> {
  const db = await getDatabase();
  const document: FundingEventDocument = {
    innovationId: input.innovationId,
    sponsorAddress: input.sponsorAddress.toLowerCase(),
    amountWei: input.amountWei,
    chainId: input.chainId,
    txHash: input.txHash.toLowerCase(),
    blockNumber: input.blockNumber,
    createdAt: new Date(),
  };

  const result = await db.collection<FundingEventDocument>(collections.fundingEvents).insertOne(document);
  return toFundingEventDto({ ...document, _id: result.insertedId });
}

export async function listFundingForInnovation(innovationId: string): Promise<FundingEventDto[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<StoredFundingEvent>(collections.fundingEvents)
    .find({ innovationId })
    .sort({ createdAt: -1 })
    .toArray();

  return documents.map(toFundingEventDto);
}
