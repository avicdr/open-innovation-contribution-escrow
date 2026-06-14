import { createInnovationSchema } from "@/domain/innovation/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { createInnovation } from "@/services/innovation/innovation-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = createInnovationSchema.parse(await request.json());
    const innovation = await createInnovation(input);

    return jsonOk(innovation, { status: 201 });
  } catch (error) {
    return jsonFromError(error);
  }
}
