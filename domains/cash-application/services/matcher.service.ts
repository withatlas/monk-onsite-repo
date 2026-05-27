import type {
  MatcherDecision,
  MatcherInvoice,
  MatcherTransaction,
} from "@/domains/cash-application/types/matcher";

export class MatcherService {
  static matchTransaction(
    transaction: MatcherTransaction,
    invoices: MatcherInvoice[],
  ): MatcherDecision {
    const candidates = invoices.filter(
      (invoice) =>
        invoice.status === "open" &&
        transaction.description.includes(invoice.invoiceNumber) &&
        transaction.amountCents === invoice.amountCents,
    );

    if (candidates.length === 1) {
      return {
        transactionId: transaction.id,
        invoiceId: candidates[0].id,
        status: "matched",
        reason: "reference_and_amount_match",
      };
    }

    if (candidates.length > 1) {
      return {
        transactionId: transaction.id,
        invoiceId: null,
        status: "ambiguous",
        reason: "ambiguous",
      };
    }

    return {
      transactionId: transaction.id,
      invoiceId: null,
      status: "unmatched",
      reason: "no_match",
    };
  }
}
