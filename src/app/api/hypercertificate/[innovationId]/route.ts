import { jsonError, jsonFromError, jsonOk } from "@/lib/api/response";
import { getHypercertificate } from "@/services/hypercertificate/hypercertificate-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  readonly params: Promise<{
    readonly innovationId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { innovationId } = await context.params;
    const hypercertificate = await getHypercertificate(innovationId);

    if (!hypercertificate) {
      return jsonError("HYPERCERTIFICATE_NOT_FOUND", "Hypercertificate was not found.", 404);
    }

    return jsonOk(hypercertificate);
  } catch (error) {
    return jsonFromError(error);
  }
}
