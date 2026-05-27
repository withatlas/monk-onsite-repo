import { describe, expect, it } from "vitest";

import { seedBankTransactions, seedInvoices } from "@/db/seed-data";
import { MatcherService } from "@/domains/cash-application/services/matcher.service";

describe("MatcherService", () => {
  it("matches an exact invoice reference and amount", () => {
    const decision = MatcherService.matchTransaction(seedBankTransactions[0], [
      seedInvoices[0],
    ]);

    expect(decision).toMatchObject({
      invoiceId: seedInvoices[0].id,
      status: "matched",
      reason: "reference_and_amount_match",
    });
  });

  it("returns unmatched when no invoice satisfies the matcher", () => {
    const transaction = {
      ...seedBankTransactions[5]!,
      description: "Incoming customer payment",
    };

    const decision = MatcherService.matchTransaction(transaction, seedInvoices);

    expect(decision).toMatchObject({
      invoiceId: null,
      status: "unmatched",
      reason: "no_match",
    });
  });
});
