import { MatchRunRoutes } from "@/domains/cash-application/routes/match-runs";
import { jsonError } from "@/lib/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payload = await MatchRunRoutes.get(id);

    if (!payload.run) {
      return Response.json({ error: "Match run not found" }, { status: 404 });
    }

    return Response.json(payload);
  } catch (error) {
    return jsonError(error);
  }
}
