import { parse } from "csv-parse/sync";
import { z } from "zod";

import type { BankTransaction, BankTransactionInsert } from "@/db/schema";
import { BankTransactionDao } from "@/domains/cash-application/dao/bank-transaction.dao";
import { MatchResultDao } from "@/domains/cash-application/dao/match-result.dao";
import { MatchRunDao } from "@/domains/cash-application/dao/match-run.dao";
import { db } from "@/domains/platform/infra/db/baseClient";
import { dollarsToCents } from "@/lib/money";

export const csvTransactionRowSchema = z
  .object({
    external_id: z.string().min(1),
    posted_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string().min(1),
    counterparty: z.string().min(1),
    amount: z.string().min(1),
    currency: z.string().length(3).optional(),
  })
  .passthrough();

export type CsvTransactionRow = z.infer<typeof csvTransactionRowSchema>;

export class CsvTransactionImportService {
  static parseCsv(contents: string): BankTransactionInsert[] {
    const rows = parse(contents, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as Record<string, string>[];

    return rows.map(row => {
      const parsed = csvTransactionRowSchema.parse(row);

      return {
        externalId: parsed.external_id,
        postedAt: parsed.posted_at,
        description: parsed.description,
        counterparty: parsed.counterparty,
        amountCents: dollarsToCents(parsed.amount),
        currency: parsed.currency ?? "USD",
      };
    });
  }

  static async importCsv(contents: string): Promise<BankTransaction[]> {
    const transactions = CsvTransactionImportService.parseCsv(contents);
    return BankTransactionDao.createMany(transactions);
  }

  static async replaceCsv(contents: string): Promise<BankTransaction[]> {
    const transactions = CsvTransactionImportService.parseCsv(contents);

    return db.transaction(async (tx) => {
      await MatchResultDao.deleteAll(tx);
      await MatchRunDao.deleteAll(tx);
      await BankTransactionDao.deleteAll(tx);
      return BankTransactionDao.createMany(transactions, tx);
    });
  }
}
