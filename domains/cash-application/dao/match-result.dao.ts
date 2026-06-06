import { desc, eq } from "drizzle-orm";

import {
  bankTransactions,
  customers,
  invoices,
  matchResults,
  type BankTransaction,
  type Customer,
  type Invoice,
  type MatchResult,
  type MatchResultInsert,
} from "@/db/schema";
import {
  db,
  handleError,
  type TransactionType,
} from "@/domains/platform/infra/db/baseClient";

export type MatchResultWithDetails = {
  result: MatchResult;
  transaction: BankTransaction;
  invoice: Invoice | null;
  customer: Customer | null;
};

export class MatchResultDao {
  static async createMany(
    rows: MatchResultInsert[],
    tx: TransactionType = db
  ): Promise<MatchResult[]> {
    try {
      if (rows.length === 0) return [];
      return await tx.insert(matchResults).values(rows).returning();
    } catch (error) {
      handleError(error, "MatchResultDao.createMany");
    }
  }

  static async listForRun(
    matchRunId: string,
    tx: TransactionType = db
  ): Promise<MatchResultWithDetails[]> {
    try {
      return await tx
        .select({
          result: matchResults,
          transaction: bankTransactions,
          invoice: invoices,
          customer: customers,
        })
        .from(matchResults)
        .innerJoin(
          bankTransactions,
          eq(matchResults.transactionId, bankTransactions.id)
        )
        .leftJoin(invoices, eq(matchResults.invoiceId, invoices.id))
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .where(eq(matchResults.matchRunId, matchRunId))
        .orderBy(desc(matchResults.createdAt));
    } catch (error) {
      handleError(error, "MatchResultDao.listForRun");
    }
  }

  static async listLatest(
    limit = 100,
    tx: TransactionType = db
  ): Promise<MatchResultWithDetails[]> {
    try {
      return await tx
        .select({
          result: matchResults,
          transaction: bankTransactions,
          invoice: invoices,
          customer: customers,
        })
        .from(matchResults)
        .innerJoin(
          bankTransactions,
          eq(matchResults.transactionId, bankTransactions.id)
        )
        .leftJoin(invoices, eq(matchResults.invoiceId, invoices.id))
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .orderBy(desc(matchResults.createdAt))
        .limit(limit);
    } catch (error) {
      handleError(error, "MatchResultDao.listLatest");
    }
  }

  static async deleteAll(tx: TransactionType = db): Promise<void> {
    try {
      await tx.delete(matchResults);
    } catch (error) {
      handleError(error, "MatchResultDao.deleteAll");
    }
  }
}
