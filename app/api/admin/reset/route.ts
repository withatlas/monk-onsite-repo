import { AdminRoutes } from "@/domains/cash-application/routes/admin";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const result = await AdminRoutes.reset(await request.json());
    return Response.json({ result });
  } catch (error) {
    return jsonError(error);
  }
}
