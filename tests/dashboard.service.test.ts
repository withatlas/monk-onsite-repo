import { afterEach, describe, expect, it, vi } from "vitest";

import { BankTransactionDao } from "@/domains/cash-application/dao/bank-transaction.dao";
import { CustomerDao } from "@/domains/cash-application/dao/customer.dao";
import { InvoiceDao } from "@/domains/cash-application/dao/invoice.dao";
import { MatchResultDao } from "@/domains/cash-application/dao/match-result.dao";
import { MatchRunDao } from "@/domains/cash-application/dao/match-run.dao";
import { CashApplicationDashboardService } from "@/domains/cash-application/services/dashboard.service";

describe("CashApplicationDashboardService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows results for the latest match run", async () => {
    vi.spyOn(CustomerDao, "listAll").mockResolvedValue([]);
    vi.spyOn(InvoiceDao, "listWithCustomers").mockResolvedValue([]);
    vi.spyOn(BankTransactionDao, "listAll").mockResolvedValue([]);
    vi.spyOn(MatchRunDao, "listRecent").mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000009002",
        status: "completed",
        startedAt: new Date("2026-05-01T00:00:00.000Z"),
        completedAt: new Date("2026-05-01T00:00:01.000Z"),
        summary: {
          transactionCount: 10,
          matchedCount: 2,
          unmatchedCount: 8,
          ambiguousCount: 0,
        },
      },
      {
        id: "00000000-0000-4000-8000-000000009001",
        status: "completed",
        startedAt: new Date("2026-04-30T00:00:00.000Z"),
        completedAt: new Date("2026-04-30T00:00:01.000Z"),
        summary: {
          transactionCount: 10,
          matchedCount: 1,
          unmatchedCount: 9,
          ambiguousCount: 0,
        },
      },
    ]);
    const listForRun = vi
      .spyOn(MatchResultDao, "listForRun")
      .mockResolvedValue([]);
    const listLatest = vi
      .spyOn(MatchResultDao, "listLatest")
      .mockResolvedValue([]);

    const dashboard = await CashApplicationDashboardService.getDashboard();

    expect(dashboard.latestRun?.id).toBe(
      "00000000-0000-4000-8000-000000009002",
    );
    expect(listForRun).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000009002",
    );
    expect(listLatest).not.toHaveBeenCalled();
    expect(dashboard.matchResults).toEqual([]);
  });

  it("shows results for a selected match run", async () => {
    vi.spyOn(CustomerDao, "listAll").mockResolvedValue([]);
    vi.spyOn(InvoiceDao, "listWithCustomers").mockResolvedValue([]);
    vi.spyOn(BankTransactionDao, "listAll").mockResolvedValue([]);
    vi.spyOn(MatchRunDao, "listRecent").mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000009002",
        status: "completed",
        startedAt: new Date("2026-05-01T00:00:00.000Z"),
        completedAt: new Date("2026-05-01T00:00:01.000Z"),
        summary: {
          transactionCount: 10,
          matchedCount: 2,
          unmatchedCount: 8,
          ambiguousCount: 0,
        },
      },
      {
        id: "00000000-0000-4000-8000-000000009001",
        status: "completed",
        startedAt: new Date("2026-04-30T00:00:00.000Z"),
        completedAt: new Date("2026-04-30T00:00:01.000Z"),
        summary: {
          transactionCount: 10,
          matchedCount: 1,
          unmatchedCount: 9,
          ambiguousCount: 0,
        },
      },
    ]);
    const listForRun = vi
      .spyOn(MatchResultDao, "listForRun")
      .mockResolvedValue([]);

    const dashboard = await CashApplicationDashboardService.getDashboard(
      "00000000-0000-4000-8000-000000009001",
    );

    expect(dashboard.latestRun?.id).toBe(
      "00000000-0000-4000-8000-000000009002",
    );
    expect(dashboard.selectedRun?.id).toBe(
      "00000000-0000-4000-8000-000000009001",
    );
    expect(listForRun).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000009001",
    );
    expect(dashboard.matchResults).toEqual([]);
  });
});
