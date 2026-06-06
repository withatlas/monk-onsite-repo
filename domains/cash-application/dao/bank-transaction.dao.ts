import { count, desc } from "drizzle-orm";

import {
  bankTransactions,
  type BankTransaction,
  type BankTransactionInsert,
} from "@/db/schema";
import {
  db,
  handleError,
  type TransactionType,
} from "@/domains/platform/infra/db/baseClient";

export class BankTransactionDao {
  static async createMany(
    rows: BankTransactionInsert[],
    tx: TransactionType = db
  ): Promise<BankTransaction[]> {
    try {
      if (rows.length === 0) return [];
      return await tx.insert(bankTransactions).values(rows).returning();
    } catch (error) {
      handleError(error, "BankTransactionDao.createMany");
    }
  }

  static async listAll(tx: TransactionType = db): Promise<BankTransaction[]> {
    try {
      return await tx
        .select()
        .from(bankTransactions)
        .orderBy(desc(bankTransactions.postedAt), desc(bankTransactions.importedAt));
    } catch (error) {
      handleError(error, "BankTransactionDao.listAll");
    }
  }

  static async count(tx: TransactionType = db): Promise<number> {
    try {
      const [row] = await tx.select({ value: count() }).from(bankTransactions);
      return row?.value ?? 0;
    } catch (error) {
      handleError(error, "BankTransactionDao.count");
    }
  }

  static async deleteAll(tx: TransactionType = db): Promise<void> {
    try {
      await tx.delete(bankTransactions);
    } catch (error) {
      handleError(error, "BankTransactionDao.deleteAll");
    }
  }
}
