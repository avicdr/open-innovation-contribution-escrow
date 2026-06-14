import { uploadMetadataSchema } from "@/domain/storage/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { uploadMetadata } from "@/services/storage/pinata-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = uploadMetadataSchema.parse(await request.json());
    const uploaded = await uploadMetadata(input);

    return jsonOk(uploaded, { status: 201 });
  } catch (error) {
    return jsonFromError(error);
  }
}
