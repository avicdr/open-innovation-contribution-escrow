import { jsonFromError, jsonOk } from "@/lib/api/response";
import { listRewardsForInnovation } from "@/services/reward/reward-repository";

export const dynamic = "force-dynamic";

type RouteContext = {
  readonly params: Promise<{
    readonly innovationId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { innovationId } = await context.params;
    const rewards = await listRewardsForInnovation(innovationId);

    return jsonOk({ rewards });
  } catch (error) {
    return jsonFromError(error);
  }
}
