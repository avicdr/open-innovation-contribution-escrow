import { cookies } from "next/headers";
import { jsonOk } from "@/lib/api/response";
import { getSessionWallet } from "@/services/auth/auth-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const walletAddress = await getSessionWallet(cookieStore.get("oice_session")?.value);

  return jsonOk({ walletAddress });
}
