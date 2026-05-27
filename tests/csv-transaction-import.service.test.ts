import { describe, expect, it, vi } from "vitest";

import { BankTransactionDao } from "@/domains/cash-application/dao/bank-transaction.dao";
import { CsvTransactionImportService } from "@/domains/cash-application/services/csv-transaction-import.service";

describe("CsvTransactionImportService", () => {
  it("parses transaction CSV rows", () => {
    const rows = CsvTransactionImportService.parseCsv(`external_id,posted_at,description,counterparty,amount,currency,memo,reference
csv-1,2026-05-01,ACH CREDIT INV-2026-1001,Brightlayer Labs,1200.00,USD,paid by parent,INV-2026-1001`);

    expect(rows).toEqual([
      expect.objectContaining({
        externalId: "csv-1",
        postedAt: "2026-05-01",
        description: "ACH CREDIT INV-2026-1001",
        counterparty: "Brightlayer Labs",
        amountCents: 120000,
        currency: "USD",
      }),
    ]);
    expect(rows[0]).not.toHaveProperty("rawPayload");
  });

  it("imports parsed transaction rows", async () => {
    const createMany = vi
      .spyOn(BankTransactionDao, "createMany")
      .mockResolvedValue([]);

    await CsvTransactionImportService.importCsv(`external_id,posted_at,description,counterparty,amount,currency
csv-2,2026-05-01,Incoming payment,A,100.00,USD
csv-3,2026-05-02,Incoming payment,B,200.00,USD`);

    expect(createMany).toHaveBeenCalledWith([
      expect.objectContaining({ externalId: "csv-2" }),
      expect.objectContaining({ externalId: "csv-3" }),
    ]);
  });
});
