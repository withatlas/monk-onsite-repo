import { readFileSync } from "node:fs";

import { parse } from "csv-parse/sync";
import { describe, expect, it } from "vitest";

import { seedCustomers, seedInvoices } from "@/db/seed-data";

type TransactionFixtureRow = {
  external_id: string;
  description: string;
  counterparty: string;
  memo: string;
  reference: string;
};

const transactionRows = parse(
  readFileSync(
    "interview-artifacts/candidate-share/new-customer-bank-export.csv",
    "utf8",
  ),
  {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  },
) as TransactionFixtureRow[];

const customerNameById = new Map(
  seedCustomers.map((customer) => [customer.id, customer.name]),
);

const invoiceByNumber = new Map(
  seedInvoices.map((invoice) => [invoice.invoiceNumber, invoice]),
);

const expectations = [
  ["txn_005", "INV-2026-1001", "Brightlayer Labs"],
  ["txn_007", "INV-2026-1006", "Juniper Cloud"],
  ["txn_010", "INV-2026-1011", "Bluebird Learning"],
  ["txn_013", "INV-2026-1004", "Summit Retail Group"],
  ["txn_017", "INV-2026-1002", "Northstar Bio"],
  ["txn_018", "INV-2026-1014", "Northstar Bio"],
  ["txn_020", "INV-2026-1022", "Harbor Freight Systems"],
  ["txn_025", "INV-2026-1025", "Crescent Foods"],
  ["txn_029", "INV-2026-1029", "Redwood Mobility"],
  ["txn_030", "INV-2026-1030", "Pioneer HR"],
  ["txn_031", "INV-2026-1038", "Northstar Bio"],
  ["txn_035", "INV-2026-1042", "Harbor Freight Systems"],
  ["txn_038", "INV-2026-1016", "Brightlayer Labs"],
  ["txn_039", "INV-2026-1017", "Brightlayer Labs"],
  ["txn_044", "INV-2026-1033", "Cobalt Analytics"],
  ["txn_046", "INV-2026-1036", "Evergreen Telecom"],
  ["txn_050", "INV-2026-1012", "Harbor Freight Systems"],
  ["txn_004", "INV-2026-1015", "Redwood Mobility"],
  ["txn_004", "INV-2026-1060", "Redwood Mobility"],
] as const;

describe("seed cash application fixture data", () => {
  it("keeps customer-specific transaction references aligned to invoice owners", () => {
    for (const [externalId, invoiceNumber, expectedCustomer] of expectations) {
      const row = transactionRows.find(
        (transaction) => transaction.external_id === externalId,
      );
      if (!row) throw new Error(`Missing transaction fixture ${externalId}`);

      const transactionText = [
        row.description,
        row.counterparty,
        row.memo,
        row.reference,
      ].join(" ");
      expect(transactionText).toContain(invoiceNumber);

      const invoice = invoiceByNumber.get(invoiceNumber);
      if (!invoice) throw new Error(`Missing seed invoice ${invoiceNumber}`);

      expect(customerNameById.get(invoice.customerId)).toBe(expectedCustomer);
    }
  });
});
