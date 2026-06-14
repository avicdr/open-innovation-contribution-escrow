import type { ContractEventDocument, RecordContractEventInput } from "@/domain/contract-event/schemas";
import type { FundingEventDocument } from "@/domain/funding/schemas";
import { collections } from "@/services/database/collections";
import { getDatabase } from "@/services/database/mongodb";

type StoredContractEvent = ContractEventDocument & {
  readonly _id: {
    toHexString(): string;
  };
};

export type ContractEventDto = Omit<ContractEventDocument, "createdAt" | "updatedAt"> & {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function normalizeEvent(input: RecordContractEventInput): RecordContractEventInput {
  return {
    ...input,
    contractAddress: input.contractAddress.toLowerCase(),
    txHash: input.txHash.toLowerCase(),
  };
}

function toContractEventDto(document: StoredContractEvent): ContractEventDto {
  return {
    id: document._id.toHexString(),
    chainId: document.chainId,
    contractAddress: document.contractAddress,
    eventName: document.eventName,
    txHash: document.txHash,
    blockNumber: document.blockNumber,
    logIndex: document.logIndex,
    removed: document.removed,
    args: document.args,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function recordContractEvents(inputs: readonly RecordContractEventInput[]): Promise<ContractEventDto[]> {
  const db = await getDatabase();
  const now = new Date();
  const collection = db.collection<ContractEventDocument>(collections.contractEvents);

  for (const rawInput of inputs) {
    const input = normalizeEvent(rawInput);

    await collection.updateOne(
      {
        chainId: input.chainId,
        txHash: input.txHash,
        logIndex: input.logIndex,
      },
      {
        $setOnInsert: {
          createdAt: now,
        },
        $set: {
          ...input,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    await materializeReadModelFromEvent(input);
  }

  const txHashes = inputs.map((event) => event.txHash.toLowerCase());
  const documents = await db
    .collection<StoredContractEvent>(collections.contractEvents)
    .find({ txHash: { $in: txHashes } })
    .sort({ blockNumber: 1, logIndex: 1 })
    .toArray();

  return documents.map(toContractEventDto);
}

async function materializeReadModelFromEvent(input: RecordContractEventInput) {
  const db = await getDatabase();
  const now = new Date();
  const innovationId = stringifyArg(input.args.innovationId);

  if (!innovationId) {
    return;
  }

  await db.collection(collections.escrowTransactions).updateOne(
    {
      chainId: input.chainId,
      txHash: input.txHash,
      logIndex: input.logIndex,
    },
    {
      $setOnInsert: { createdAt: now },
      $set: {
        innovationId,
        chainId: input.chainId,
        contractAddress: input.contractAddress,
        eventName: input.eventName,
        txHash: input.txHash,
        blockNumber: input.blockNumber,
        logIndex: input.logIndex,
        args: input.args,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  if (input.eventName === "FundsDeposited") {
    const sponsorAddress = stringifyArg(input.args.sponsor);
    const amountWei = stringifyArg(input.args.amount);

    if (!sponsorAddress || !amountWei) {
      return;
    }

    const funding: FundingEventDocument = {
      innovationId,
      sponsorAddress: sponsorAddress.toLowerCase(),
      amountWei,
      chainId: input.chainId,
      txHash: input.txHash,
      blockNumber: input.blockNumber,
      createdAt: now,
    };

    await db.collection<FundingEventDocument>(collections.fundingEvents).updateOne(
      {
        chainId: input.chainId,
        txHash: input.txHash,
      },
      {
        $setOnInsert: {
          createdAt: now,
        },
        $set: funding,
      },
      { upsert: true },
    );
  }
}

function stringifyArg(value: unknown) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return undefined;
}

export async function listContractEventsByInnovation(innovationId: string): Promise<ContractEventDto[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<StoredContractEvent>(collections.contractEvents)
    .find({
      $or: [
        { "args.innovationId": innovationId },
        { "args.innovationId": Number.isFinite(Number(innovationId)) ? Number(innovationId) : innovationId },
      ],
    })
    .sort({ blockNumber: 1, logIndex: 1 })
    .toArray();

  return documents.map(toContractEventDto);
}
