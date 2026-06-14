import { cancelBountySchema } from "@/domain/bounty/schemas";
import { jsonError, jsonFromError, jsonOk } from "@/lib/api/response";
import { cancelBounty, getBountyById } from "@/services/bounty/bounty-repository";

export const dynamic = "force-dynamic";

type RouteContext = {
  readonly params: Promise<{
    readonly bountyId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { bountyId } = await context.params;
    const bounty = await getBountyById(bountyId);

    if (!bounty) {
      return jsonError("BOUNTY_NOT_FOUND", "Bounty was not found.", 404);
    }

    return jsonOk(bounty);
  } catch (error) {
    return jsonFromError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { bountyId } = await context.params;
    const input = cancelBountySchema.parse(await request.json());
    const bounty = await cancelBounty(bountyId, input);

    if (!bounty) {
      return jsonError(
        "BOUNTY_NOT_CANCELLABLE",
        "Only the bounty owner can cancel an open bounty that has not been completed.",
        409,
      );
    }

    return jsonOk(bounty);
  } catch (error) {
    return jsonFromError(error);
  }
}
