import { innovationDraftInputSchema } from "@/domain/ai/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { generateInnovationDraft } from "@/services/ai/gemini-service";
import { fetchRepoContext, formatRepoContext } from "@/services/github/github-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = innovationDraftInputSchema.parse(await request.json());

    const repoContext = input.githubUrl ? await fetchRepoContext(input.githubUrl) : null;

    const draft = await generateInnovationDraft({
      prompt: input.prompt,
      githubUrl: input.githubUrl,
      repoContext: repoContext ? formatRepoContext(repoContext) : undefined,
    });

    return jsonOk(draft);
  } catch (error) {
    return jsonFromError(error);
  }
}
