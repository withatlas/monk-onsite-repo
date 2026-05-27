import type { BankTransaction, Invoice } from "@/db/schema";

export type MatcherInvoice = Pick<
  Invoice,
  "id" | "invoiceNumber" | "amountCents" | "status"
>;

export type MatcherTransaction = Pick<
  BankTransaction,
  "id" | "description" | "amountCents"
>;

export type MatcherDecision = {
  transactionId: string;
  invoiceId: string | null;
  status: "matched" | "unmatched" | "ambiguous";
  reason: "reference_and_amount_match" | "no_match" | "ambiguous";
};
