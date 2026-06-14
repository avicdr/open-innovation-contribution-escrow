import { z } from "zod";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { listContributionsForInnovation } from "@/services/contribution/contribution-repository";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(250).default(100),
});

type RouteContext = {
  readonly params: Promise<{
    readonly innovationId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { innovationId } = await context.params;
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams.entries()));
    const contributions = await listContributionsForInnovation(innovationId, query.limit);

    return jsonOk({ contributions });
  } catch (error) {
    return jsonFromError(error);
  }
}
