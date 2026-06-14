import type { UploadMetadataInput, UploadedMetadata } from "@/domain/storage/schemas";
import { requireServerEnv } from "@/lib/config/env";
import { metadataHash, stableStringify } from "@/services/storage/hash";

type PinataResponse = {
  readonly IpfsHash?: string;
  readonly cid?: string;
};

export async function uploadMetadata(input: UploadMetadataInput): Promise<UploadedMetadata> {
  const jwt = requireServerEnv("PINATA_JWT");
  const body = {
    pinataMetadata: {
      name: `oice-${input.subject}-${input.name}`,
      keyvalues: {
        subject: input.subject,
      },
    },
    pinataContent: input.metadata,
  };
  const serialized = stableStringify(body.pinataContent);
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as PinataResponse;
  const cid = payload.IpfsHash ?? payload.cid;

  if (!cid) {
    throw new Error("Pinata upload response did not include an IPFS CID.");
  }

  return {
    subject: input.subject,
    name: input.name,
    uri: `ipfs://${cid}`,
    cid,
    metadataHash: metadataHash(input.metadata),
    byteLength: Buffer.byteLength(serialized),
  };
}
