import { nonceRequestSchema } from "@/domain/auth/schemas";
import { jsonError, jsonFromError, jsonOk } from "@/lib/api/response";
import { createWalletNonce } from "@/services/auth/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = nonceRequestSchema.parse(await request.json());
    const nonce = await createWalletNonce(input.walletAddress);

    return jsonOk(nonce, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("nonce")) {
      return jsonError("AUTH_NONCE_ERROR", error.message, 400);
    }

    return jsonFromError(error);
  }
}
