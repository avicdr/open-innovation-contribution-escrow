import { recordContractEventsSchema } from "@/domain/contract-event/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { recordContractEvents } from "@/services/contract-events/contract-event-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = recordContractEventsSchema.parse(await request.json());
    const events = await recordContractEvents(input.events);

    return jsonOk({ events }, { status: 201 });
  } catch (error) {
    return jsonFromError(error);
  }
}
