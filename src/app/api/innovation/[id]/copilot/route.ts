import { copilotInputSchema } from "@/domain/ai/schemas";
import { jsonError, jsonFromError, jsonOk } from "@/lib/api/response";
import { generateCopilotPlan } from "@/services/ai/gemini-service";
import { attachCopilotPlanToInnovation, getInnovationById } from "@/services/innovation/innovation-repository";

export const dynamic = "force-dynamic";

type RouteContext = {
  readonly params: Promise<{
    readonly id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const innovation = await getInnovationById(id);

    if (!innovation) {
      return jsonError("NOT_FOUND", "Innovation not found.", 404);
    }

    const input = copilotInputSchema.parse({
      title: innovation.title,
      summary: innovation.summary,
      description: innovation.description,
      category: innovation.category,
      tags: innovation.tags,
      currentTeam: [],
      currentProgress: "New innovation registered. Generate the initial execution plan.",
    });
    const plan = await generateCopilotPlan(input);
    const updatedInnovation = await attachCopilotPlanToInnovation(id, plan);

    return jsonOk({ plan, innovation: updatedInnovation });
  } catch (error) {
    return jsonFromError(error);
  }
}
