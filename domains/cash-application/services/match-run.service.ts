import type { MatchResultInsert, MatchRun, MatchRunSummary } from "@/db/schema";
import { BankTransactionDao } from "@/domains/cash-application/dao/bank-transaction.dao";
import { InvoiceDao } from "@/domains/cash-application/dao/invoice.dao";
import { MatchResultDao } from "@/domains/cash-application/dao/match-result.dao";
import { MatchRunDao } from "@/domains/cash-application/dao/match-run.dao";
import { MatcherService } from "@/domains/cash-application/services/matcher.service";

export class MatchRunService {
  static async runMatching(): Promise<MatchRun> {
    const run = await MatchRunDao.create({ status: "running" });

    try {
      const [transactions, invoices] = await Promise.all([
        BankTransactionDao.listAll(),
        InvoiceDao.listOpen(),
      ]);

      const decisions = transactions.map((transaction) =>
        MatcherService.matchTransaction(transaction, invoices),
      );

      const resultRows: MatchResultInsert[] = decisions.map((decision) => ({
        matchRunId: run.id,
        transactionId: decision.transactionId,
        invoiceId: decision.invoiceId,
        status: decision.status,
        reason: decision.reason,
      }));

      await MatchResultDao.createMany(resultRows);

      const summary: MatchRunSummary = {
        transactionCount: decisions.length,
        matchedCount: decisions.filter((d) => d.status === "matched").length,
        unmatchedCount: decisions.filter((d) => d.status === "unmatched")
          .length,
        ambiguousCount: decisions.filter((d) => d.status === "ambiguous")
          .length,
      };

      return MatchRunDao.complete(run.id, summary);
    } catch (error) {
      await MatchRunDao.fail(run.id);
      throw error;
    }
  }

  static async getRun(id: string) {
    const [run, results] = await Promise.all([
      MatchRunDao.findById(id),
      MatchResultDao.listForRun(id),
    ]);

    return { run, results };
  }
}
