import { jsonOk } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function POST() {
  return jsonOk(
    {
      message:
        "Manual funding records are disabled. Call depositFunds() on the escrow contract and index the FundsDeposited event.",
    },
    { status: 405 },
  );
}
