import { bountyCategorySchema, bountyStatusSchema } from "@/domain/bounty/schemas";
import { jsonFromError, jsonOk } from "@/lib/api/response";
import { listBounties } from "@/services/bounty/bounty-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryParam = url.searchParams.get("category");
    const statusParam = url.searchParams.get("status");

    const category = bountyCategorySchema.safeParse(categoryParam);
    const status = bountyStatusSchema.safeParse(statusParam);

    const bounties = await listBounties({
      category: category.success ? category.data : undefined,
      status: status.success ? status.data : undefined,
    });

    return jsonOk({ bounties });
  } catch (error) {
    return jsonFromError(error);
  }
}
