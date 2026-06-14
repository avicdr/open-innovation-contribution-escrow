import { jsonFromError, jsonOk } from "@/lib/api/response";
import { listFundingForInnovation } from "@/services/funding/funding-repository";

export const dynamic = "force-dynamic";

type RouteContext = {
  readonly params: Promise<{
    readonly innovationId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { innovationId } = await context.params;
    const fundingEvents = await listFundingForInnovation(innovationId);

    return jsonOk({ fundingEvents });
  } catch (error) {
    return jsonFromError(error);
  }
}
