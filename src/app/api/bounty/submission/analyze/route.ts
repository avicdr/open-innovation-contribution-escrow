import { bountySubmissionAnalysisInputSchema } from "@/domain/ai/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { analyzeBountySubmission } from "@/services/ai/gemini-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = bountySubmissionAnalysisInputSchema.parse(await request.json());
    const analysis = await analyzeBountySubmission(input);

    return jsonOk(analysis);
  } catch (error) {
    return jsonFromError(error);
  }
}
