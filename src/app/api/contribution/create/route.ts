import { recordAnchoredContributionSchema } from "@/domain/contribution/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { recordAnchoredContribution } from "@/services/contribution/contribution-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = recordAnchoredContributionSchema.parse(await request.json());
    const contribution = await recordAnchoredContribution(input);

    return jsonOk(contribution, { status: 201 });
  } catch (error) {
    return jsonFromError(error);
  }
}
