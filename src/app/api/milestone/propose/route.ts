import { proposeMilestoneSchema } from "@/domain/milestone/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { proposeMilestone } from "@/services/milestone/milestone-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = proposeMilestoneSchema.parse(await request.json());
    const proposal = await proposeMilestone(input);

    return jsonOk(proposal, { status: 201 });
  } catch (error) {
    return jsonFromError(error);
  }
}
