import { jsonFromError, jsonOk } from "@/lib/api/response";
import { listMilestonesForInnovation } from "@/services/milestone/milestone-repository";

export const dynamic = "force-dynamic";

type RouteContext = {
  readonly params: Promise<{
    readonly innovationId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { innovationId } = await context.params;
    const milestones = await listMilestonesForInnovation(innovationId);

    return jsonOk({ milestones });
  } catch (error) {
    return jsonFromError(error);
  }
}
