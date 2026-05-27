import { z } from "zod";

import { MatchRunService } from "@/domains/cash-application/services/match-run.service";

export const matchRunIdSchema = z.string().uuid();

export class MatchRunRoutes {
  static async create() {
    return MatchRunService.runMatching();
  }

  static async get(id: unknown) {
    return MatchRunService.getRun(matchRunIdSchema.parse(id));
  }
}
