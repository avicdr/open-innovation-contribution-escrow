import { jsonOk } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function POST() {
  return jsonOk(
    {
      message:
        "Manual reward distribution is disabled. The project owner chooses a reward amount, then distributeRewards() calculates and pays shares on the escrow contract.",
    },
    { status: 405 },
  );
}
