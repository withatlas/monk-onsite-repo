import { describe, expect, it } from "vitest";

import { seedInvoices } from "@/db/seed-data";
import { MatcherService } from "@/domains/cash-application/services/matcher.service";

describe("MatcherService", () => {
  it("returns a matched decision for a linked payment", () => {
    const invoice = seedInvoices[0]!;
    const decision = MatcherService.matchTransaction(
      {
        id: "00000000-0000-4000-8000-000000002001",
        description: `ACH CREDIT ${invoice.invoiceNumber}`,
        amountCents: invoice.amountCents,
      },
      [invoice],
    );

    expect(decision).toMatchObject({
      invoiceId: invoice.id,
      status: "matched",
      reason: "reference_and_amount_match",
    });
  });

  it("returns unmatched for an unlinked payment", () => {
    const transaction = {
      id: "00000000-0000-4000-8000-000000002002",
      amountCents: seedInvoices[5]!.amountCents,
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
