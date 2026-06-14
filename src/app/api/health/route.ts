import { jsonOk } from "@/lib/api/response";
import { serverEnv } from "@/lib/config/env";

export const dynamic = "force-dynamic";

export function GET() {
  return jsonOk({
    service: "oice-api",
    status: "ok",
    database: serverEnv.MONGODB_URI ? "configured" : "unconfigured",
    ai: serverEnv.GEMINI_API_KEY ? "configured" : "unconfigured",
    chain: serverEnv.BASE_SEPOLIA_RPC_URL ? "configured" : "unconfigured",
    storage: serverEnv.PINATA_JWT ? "configured" : "unconfigured",
  });
}
