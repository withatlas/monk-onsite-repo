import { BankTransactionDao } from "@/domains/cash-application/dao/bank-transaction.dao";
import { CustomerDao } from "@/domains/cash-application/dao/customer.dao";
import { InvoiceDao } from "@/domains/cash-application/dao/invoice.dao";
import { MatchResultDao } from "@/domains/cash-application/dao/match-result.dao";
import { MatchRunDao } from "@/domains/cash-application/dao/match-run.dao";

export class CashApplicationDashboardService {
  static async getDashboard(selectedRunId?: string) {
    const [customers, invoices, transactions, matchRuns] = await Promise.all([
      CustomerDao.listAll(),
      InvoiceDao.listWithCustomers(),
      BankTransactionDao.listAll(),
      MatchRunDao.listRecent(20),
    ]);

    const latestRun = matchRuns[0] ?? null;
    const selectedRun =
      matchRuns.find((run) => run.id === selectedRunId) ??
      (selectedRunId ? await MatchRunDao.findById(selectedRunId) : null) ??
      latestRun;
    const matchResults = selectedRun
      ? await MatchResultDao.listForRun(selectedRun.id)
      : [];
    const latestSummary = latestRun?.summary ?? {
      transactionCount: 0,
      matchedCount: 0,
      unmatchedCount: 0,
      ambiguousCount: 0,
    };

    return {
      customers,
      invoices,
      transactions,
      matchRuns,
      matchResults,
      latestRun,
      selectedRun,
      stats: {
        customerCount: customers.length,
        invoiceCount: invoices.length,
        transactionCount: transactions.length,
        latestSummary,
      },
    };
  }
}
