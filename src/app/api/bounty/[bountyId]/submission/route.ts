import { createBountySubmissionSchema } from "@/domain/bounty/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { createBountySubmission, listSubmissionsForBounty } from "@/services/bounty/bounty-repository";

export const dynamic = "force-dynamic";

type RouteContext = {
  readonly params: Promise<{
    readonly bountyId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { bountyId } = await context.params;
    const submissions = await listSubmissionsForBounty(bountyId);

    return jsonOk({ submissions });
  } catch (error) {
    return jsonFromError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { bountyId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const input = createBountySubmissionSchema.parse({ ...body, bountyId });
    const submission = await createBountySubmission(input);

    return jsonOk(submission, { status: 201 });
  } catch (error) {
    return jsonFromError(error);
  }
}
