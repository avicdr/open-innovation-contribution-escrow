import { verifyWalletSchema } from "@/domain/auth/schemas";
import { jsonError, jsonFromError, jsonOk } from "@/lib/api/response";
import { verifyWalletLogin } from "@/services/auth/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = verifyWalletSchema.parse(await request.json());
    const session = await verifyWalletLogin(input.walletAddress, input.signature as `0x${string}`);
    const response = jsonOk({ walletAddress: session.walletAddress });

    response.cookies.set("oice_session", session.sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Wallet")) {
      return jsonError("AUTH_VERIFICATION_FAILED", error.message, 401);
    }

    return jsonFromError(error);
  }
}
