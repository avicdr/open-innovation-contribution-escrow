import { createBountySchema } from "@/domain/bounty/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { createBounty } from "@/services/bounty/bounty-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = createBountySchema.parse(await request.json());
    const bounty = await createBounty(input);

    return jsonOk(bounty, { status: 201 });
  } catch (error) {
    return jsonFromError(error);
  }
}
