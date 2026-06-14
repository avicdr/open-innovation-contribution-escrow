import { createMilestoneSchema } from "@/domain/milestone/schemas";
import { jsonError, jsonFromError, jsonOk } from "@/lib/api/response";
import { getInnovationById } from "@/services/innovation/innovation-repository";
import { createMilestone } from "@/services/milestone/milestone-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = createMilestoneSchema.parse(await request.json());
    const innovation = await getInnovationById(input.innovationId);

    if (!innovation) {
      return jsonError("NOT_FOUND", "Innovation not found.", 404);
    }

    if (innovation.creatorWalletAddress.toLowerCase() !== input.ownerAddress.toLowerCase()) {
      return jsonError("FORBIDDEN", "Only the project owner can create official milestones.", 403);
    }

    const milestone = await createMilestone(input);

    return jsonOk(milestone, { status: 201 });
  } catch (error) {
    return jsonFromError(error);
  }
}
