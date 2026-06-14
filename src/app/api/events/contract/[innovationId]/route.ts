import { jsonFromError, jsonOk } from "@/lib/api/response";
import { listContractEventsByInnovation } from "@/services/contract-events/contract-event-repository";

export const dynamic = "force-dynamic";

type RouteContext = {
  readonly params: Promise<{
    readonly innovationId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { innovationId } = await context.params;
    const events = await listContractEventsByInnovation(innovationId);

    return jsonOk({ events });
  } catch (error) {
    return jsonFromError(error);
  }
}
