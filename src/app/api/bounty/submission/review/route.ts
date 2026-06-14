import { reviewBountySubmissionSchema } from "@/domain/bounty/schemas";
import { jsonError, jsonFromError, jsonOk } from "@/lib/api/response";
import { reviewBountySubmission } from "@/services/bounty/bounty-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = reviewBountySubmissionSchema.parse(await request.json());
    const submission = await reviewBountySubmission(input);

    if (!submission) {
      return jsonError("SUBMISSION_NOT_FOUND", "Submission was not found.", 404);
    }

    return jsonOk(submission);
  } catch (error) {
    return jsonFromError(error);
  }
}
