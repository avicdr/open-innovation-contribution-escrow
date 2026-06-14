import { z } from "zod";

export const metadataSubjectSchema = z.enum(["innovation", "contribution", "proof", "hypercertificate"]);

export const uploadMetadataSchema = z.object({
  subject: metadataSubjectSchema,
  name: z.string().min(1).max(160),
  metadata: z.record(z.unknown()),
});

export type UploadMetadataInput = z.infer<typeof uploadMetadataSchema>;

export type UploadedMetadata = {
  readonly subject: z.infer<typeof metadataSubjectSchema>;
  readonly name: string;
  readonly uri: string;
  readonly cid: string;
  readonly metadataHash: `0x${string}`;
  readonly byteLength: number;
};
