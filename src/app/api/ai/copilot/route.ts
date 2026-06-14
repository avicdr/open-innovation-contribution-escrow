import { copilotInputSchema } from "@/domain/ai/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { generateCopilotPlan } from "@/services/ai/gemini-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = copilotInputSchema.parse(await request.json());
    const plan = await generateCopilotPlan(input);

    return jsonOk(plan);
  } catch (error) {
    return jsonFromError(error);
  }
}
