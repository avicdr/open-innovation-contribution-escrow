import { approveMilestoneSchema } from "@/domain/milestone/schemas";
import { jsonError, jsonFromError, jsonOk } from "@/lib/api/response";
import { approveMilestone } from "@/services/milestone/milestone-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = approveMilestoneSchema.parse(await request.json());
    const milestone = await approveMilestone(input);

    if (!milestone) {
      return jsonError("MILESTONE_NOT_FOUND", "Milestone was not found.", 404);
    }

    return jsonOk(milestone);
  } catch (error) {
    return jsonFromError(error);
  }
}
