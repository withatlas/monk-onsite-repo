import { desc, eq } from "drizzle-orm";

import {
  matchRuns,
  type MatchRun,
  type MatchRunInsert,
  type MatchRunSummary,
} from "@/db/schema";
import {
  db,
  handleError,
  type TransactionType,
} from "@/domains/platform/infra/db/baseClient";

export class MatchRunDao {
  static async create(
    data: MatchRunInsert = {},
    tx: TransactionType = db
  ): Promise<MatchRun> {
    try {
      const [created] = await tx.insert(matchRuns).values(data).returning();
      return created;
    } catch (error) {
      handleError(error, "MatchRunDao.create");
    }
  }

  static async complete(
    id: string,
    summary: MatchRunSummary,
    tx: TransactionType = db
  ): Promise<MatchRun> {
    try {
      const [updated] = await tx
        .update(matchRuns)
        .set({ status: "completed", completedAt: new Date(), summary })
        .where(eq(matchRuns.id, id))
        .returning();

      return updated;
    } catch (error) {
      handleError(error, "MatchRunDao.complete");
    }
  }

  static async fail(id: string, tx: TransactionType = db): Promise<MatchRun> {
    try {
      const [updated] = await tx
        .update(matchRuns)
        .set({ status: "failed", completedAt: new Date() })
        .where(eq(matchRuns.id, id))
        .returning();

      return updated;
    } catch (error) {
      handleError(error, "MatchRunDao.fail");
    }
  }

  static async listRecent(limit = 10, tx: TransactionType = db): Promise<MatchRun[]> {
    try {
      return await tx
        .select()
        .from(matchRuns)
        .orderBy(desc(matchRuns.startedAt))
        .limit(limit);
    } catch (error) {
      handleError(error, "MatchRunDao.listRecent");
    }
  }

  static async findById(
    id: string,
    tx: TransactionType = db
  ): Promise<MatchRun | null> {
    try {
      const [run] = await tx
        .select()
        .from(matchRuns)
        .where(eq(matchRuns.id, id))
        .limit(1);

      return run ?? null;
    } catch (error) {
      handleError(error, "MatchRunDao.findById");
    }
  }
}
