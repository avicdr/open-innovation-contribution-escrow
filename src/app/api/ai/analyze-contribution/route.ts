import { contributionAnalysisInputSchema } from "@/domain/ai/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { analyzeContribution } from "@/services/ai/gemini-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = contributionAnalysisInputSchema.parse(await request.json());
    const analysis = await analyzeContribution(input);

    return jsonOk(analysis);
  } catch (error) {
    return jsonFromError(error);
  }
}
