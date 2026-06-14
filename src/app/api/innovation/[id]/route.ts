import { deleteInnovationSchema } from "@/domain/innovation/schemas";
import { jsonError, jsonFromError, jsonOk } from "@/lib/api/response";
import { deleteFreshInnovation, getInnovationById } from "@/services/innovation/innovation-repository";

export const dynamic = "force-dynamic";

type RouteContext = {
  readonly params: Promise<{
    readonly id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const innovation = await getInnovationById(id);

    if (!innovation) {
      return jsonError("INNOVATION_NOT_FOUND", "Innovation was not found.", 404);
    }

    return jsonOk(innovation);
  } catch (error) {
    return jsonFromError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const input = deleteInnovationSchema.parse(await request.json());
    const result = await deleteFreshInnovation(id, input);

    if (result.deleted) {
      return jsonOk({ deleted: true });
    }

    if (result.code === "NOT_FOUND") {
      return jsonError("INNOVATION_NOT_FOUND", result.message, 404);
    }

    if (result.code === "FORBIDDEN") {
      return jsonError("FORBIDDEN", result.message, 403);
    }

    return jsonError("PROJECT_NOT_FRESH", result.message, 409, { blockers: result.blockers ?? [] });
  } catch (error) {
    return jsonFromError(error);
  }
}
