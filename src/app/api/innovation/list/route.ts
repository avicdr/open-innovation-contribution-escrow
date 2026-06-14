import { z } from "zod";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { listInnovations } from "@/services/innovation/innovation-repository";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams.entries()));
    const innovations = await listInnovations(query.limit);

    return jsonOk({ innovations });
  } catch (error) {
    return jsonFromError(error);
  }
}
