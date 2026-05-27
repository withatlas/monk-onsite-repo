import { MatchRunRoutes } from "@/domains/cash-application/routes/match-runs";
import { MatchRunDao } from "@/domains/cash-application/dao/match-run.dao";
import { jsonError } from "@/lib/http";

export async function GET() {
  try {
    const matchRuns = await MatchRunDao.listRecent(20);
    return Response.json({ matchRuns });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST() {
  try {
    const matchRun = await MatchRunRoutes.create();
    return Response.json({ matchRun }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
