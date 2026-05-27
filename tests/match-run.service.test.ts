import { afterEach, describe, expect, it, vi } from "vitest";

import { seedInvoices } from "@/db/seed-data";
import { BankTransactionDao } from "@/domains/cash-application/dao/bank-transaction.dao";
import { InvoiceDao } from "@/domains/cash-application/dao/invoice.dao";
import { MatchResultDao } from "@/domains/cash-application/dao/match-result.dao";
import { MatchRunDao } from "@/domains/cash-application/dao/match-run.dao";
import { MatchRunService } from "@/domains/cash-application/services/match-run.service";

const transactionId = (index: number) =>
  `00000000-0000-4000-8000-${String(2001 + index).padStart(12, "0")}`;

const selectedTransaction = (index: number) => ({
  id: transactionId(index),
  externalId: `test-transaction-${index + 1}`,
  postedAt: "2026-05-01",
  description: `ACH CREDIT ${seedInvoices[index]!.invoiceNumber}`,
  counterparty: "Test Counterparty",
  amountCents: seedInvoices[index]!.amountCents,
  currency: "USD",
  rawPayload: {},
  importedAt: new Date("2026-05-01T00:00:00.000Z"),
});

const selectedInvoice = (index: number) => ({
  ...seedInvoices[index]!,
  status: seedInvoices[index]!.status ?? "open",
  currency: seedInvoices[index]!.currency ?? "USD",
  memo: seedInvoices[index]!.memo ?? null,
  createdAt: new Date("2026-05-01T00:00:00.000Z"),
  updatedAt: new Date("2026-05-01T00:00:00.000Z"),
});

describe("MatchRunService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("persists match results for a run", async () => {
    vi.spyOn(MatchRunDao, "create").mockResolvedValue({
      id: "00000000-0000-4000-8000-000000009001",
      status: "running",
      startedAt: new Date(),
      completedAt: null,
      summary: null,
    });
    vi.spyOn(BankTransactionDao, "listAll").mockResolvedValue(
      [selectedTransaction(0), selectedTransaction(1)]
    );
    vi.spyOn(InvoiceDao, "listOpen").mockResolvedValue([
      selectedInvoice(0),
      selectedInvoice(1),
    ]);
    vi.spyOn(MatchResultDao, "createMany").mockResolvedValue([]);
    const complete = vi.spyOn(MatchRunDao, "complete").mockResolvedValue({
      id: "00000000-0000-4000-8000-000000009001",
      status: "completed",
      startedAt: new Date(),
      completedAt: new Date(),
      summary: {
        transactionCount: 2,
        matchedCount: 2,
        unmatchedCount: 0,
        ambiguousCount: 0,
      },
    });

    const run = await MatchRunService.runMatching();

    expect(MatchResultDao.createMany).toHaveBeenCalledWith([
      expect.objectContaining({
        matchRunId: "00000000-0000-4000-8000-000000009001",
        transactionId: transactionId(0),
        invoiceId: seedInvoices[0].id,
        status: "matched",
      }),
      expect.objectContaining({
        matchRunId: "00000000-0000-4000-8000-000000009001",
        transactionId: transactionId(1),
        invoiceId: seedInvoices[1].id,
        status: "matched",
      }),
    ]);
    expect(complete).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000009001",
      {
        transactionCount: 2,
        matchedCount: 2,
        unmatchedCount: 0,
        ambiguousCount: 0,
      }
    );
    expect(run.status).toBe("completed");
  });

  it("can run again against the same transaction set", async () => {
    vi.spyOn(BankTransactionDao, "listAll").mockResolvedValue(
      [selectedTransaction(0)]
    );
    vi.spyOn(InvoiceDao, "listOpen").mockResolvedValue([selectedInvoice(0)]);
    vi.spyOn(MatchResultDao, "createMany").mockResolvedValue([]);
    vi.spyOn(MatchRunDao, "create")
      .mockResolvedValueOnce({
        id: "00000000-0000-4000-8000-000000009101",
        status: "running",
        startedAt: new Date(),
        completedAt: null,
        summary: null,
      })
      .mockResolvedValueOnce({
        id: "00000000-0000-4000-8000-000000009102",
        status: "running",
        startedAt: new Date(),
        completedAt: null,
        summary: null,
      });
    vi.spyOn(MatchRunDao, "complete")
      .mockImplementationOnce(async (id, summary) => ({
        id,
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        summary,
      }))
      .mockImplementationOnce(async (id, summary) => ({
        id,
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        summary,
      }));

    await MatchRunService.runMatching();
    await MatchRunService.runMatching();

    expect(MatchResultDao.createMany).toHaveBeenCalledTimes(2);
  });
});
