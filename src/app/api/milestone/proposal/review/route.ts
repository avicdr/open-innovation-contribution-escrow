import { reviewMilestoneProposalSchema } from "@/domain/milestone/schemas";
import { jsonError, jsonFromError, jsonOk } from "@/lib/api/response";
import { getInnovationById } from "@/services/innovation/innovation-repository";
import { getMilestoneProposalById, reviewMilestoneProposal } from "@/services/milestone/milestone-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = reviewMilestoneProposalSchema.parse(await request.json());
    const existingProposal = await getMilestoneProposalById(input.proposalId);

    if (!existingProposal) {
      return jsonError("NOT_FOUND", "Milestone proposal not found.", 404);
    }

    const innovation = await getInnovationById(existingProposal.innovationId);

    if (!innovation) {
      return jsonError("NOT_FOUND", "Innovation not found.", 404);
    }

    if (innovation.creatorWalletAddress.toLowerCase() !== input.reviewerAddress.toLowerCase()) {
      return jsonError("FORBIDDEN", "Only the project owner can review milestone proposals.", 403);
    }

    const proposal = await reviewMilestoneProposal(input);

    if (!proposal) {
      return jsonError("ALREADY_REVIEWED", "This milestone proposal has already been reviewed.", 409);
    }

    return jsonOk(proposal);
  } catch (error) {
    return jsonFromError(error);
  }
}
