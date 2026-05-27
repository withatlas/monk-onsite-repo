import type { BankTransactionInsert, CustomerInsert, InvoiceInsert } from "@/db/schema";

const uuidFromNumber = (value: number) =>
  `00000000-0000-4000-8000-${value.toString(16).padStart(12, "0")}`;

const customerRows = [
  ["Brightlayer Labs", "CUST-001", ["Brightlayer", "Bright Layer"]],
  ["Northstar Bio", "CUST-002", ["Northstar", "NS Bio"]],
  ["Cobalt Analytics", "CUST-003", ["Cobalt", "Cobalt Data"]],
  ["Summit Retail Group", "CUST-004", ["Summit Retail", "SRG"]],
  ["Prairie Health", "CUST-005", ["Prairie", "Prairie Health Inc"]],
  ["Juniper Cloud", "CUST-006", ["Juniper", "JCloud"]],
  ["Harbor Freight Systems", "CUST-007", ["Harbor Systems", "HFS"]],
  ["Maple Robotics", "CUST-008", ["Maple", "Maple Robo"]],
  ["Arcadia Energy", "CUST-009", ["Arcadia", "Arc Energy"]],
  ["Pioneer HR", "CUST-010", ["Pioneer", "Pioneer People"]],
  ["Bluebird Learning", "CUST-011", ["Bluebird", "BB Learning"]],
  ["Crescent Foods", "CUST-012", ["Crescent", "Crescent Food Co"]],
  ["Evergreen Telecom", "CUST-013", ["Evergreen", "EG Telecom"]],
  ["Lumen Legal", "CUST-014", ["Lumen", "Lumen Counsel"]],
  ["Redwood Mobility", "CUST-015", ["Redwood", "RWM"]],
] as const;

const amountCycle = [
  120000, 180000, 235000, 275000, 315000, 420000, 485000, 520000, 640000,
  750000, 860000, 990000,
];

const paidInvoiceIndexes = new Set([7, 18, 29, 40, 51, 58]);

export const seedCustomers = customerRows.map(
  ([name, externalRef, aliases], index) => ({
    id: uuidFromNumber(index + 1),
    name,
    externalRef,
    aliases: [...aliases],
  })
) satisfies CustomerInsert[];

export const seedInvoices = Array.from({ length: 60 }).map(
  (_, index) => {
    const month = Math.floor(index / 15) + 1;
    const day = (index % 15) + 1;
    const invoiceNumber = `INV-2026-${String(1001 + index)}`;
    const issueDate = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dueDate = `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return {
      id: uuidFromNumber(1001 + index),
      customerId: seedCustomers[index % seedCustomers.length]!.id,
      invoiceNumber,
      issueDate,
      dueDate,
      status: paidInvoiceIndexes.has(index) ? "paid" : "open",
      amountCents: amountCycle[index % amountCycle.length] + index * 1100,
      currency: "USD",
      memo: `Subscription services for ${issueDate.slice(0, 7)}`,
    };
  }
) satisfies InvoiceInsert[];

const invoiceAt = (index: number) => seedInvoices[index];

const aprilTransactions = [0, 1, 2, 3, 4].map(index => ({
  id: uuidFromNumber(2001 + index),
  externalId: `bank-2026-04-${String(index + 1).padStart(3, "0")}`,
  postedAt: `2026-04-${String(index + 3).padStart(2, "0")}`,
  description: `ACH CREDIT ${invoiceAt(index).invoiceNumber}`,
  counterparty: seedCustomers[index].name,
  amountCents: invoiceAt(index).amountCents,
  currency: "USD",
  rawPayload: { source: "seed", lane: "ach" },
})) satisfies BankTransactionInsert[];

const scenarioTransactions = [
  {
    id: uuidFromNumber(2010),
    externalId: "bank-2026-04-010",
    postedAt: "2026-04-08",
    description: `${invoiceAt(7).invoiceNumber} remittance`,
    counterparty: "Wire Transfer",
    amountCents: invoiceAt(7).amountCents,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2011),
    externalId: "bank-2026-04-011",
    postedAt: "2026-04-09",
    description: `${invoiceAt(12).invoiceNumber} remittance`,
    counterparty: "Northstar",
    amountCents: Math.round(invoiceAt(12).amountCents / 2),
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2012),
    externalId: "bank-2026-04-012",
    postedAt: "2026-04-10",
    description: `${invoiceAt(13).invoiceNumber} ${invoiceAt(14).invoiceNumber}`,
    counterparty: "Cobalt Data",
    amountCents: invoiceAt(13).amountCents + invoiceAt(14).amountCents,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2013),
    externalId: "bank-2026-04-013",
    postedAt: "2026-04-11",
    description: `${invoiceAt(15).invoiceNumber} processor payout`,
    counterparty: "Card Processor",
    amountCents: invoiceAt(15).amountCents - 2900,
    currency: "USD",
    rawPayload: { source: "seed", feeCents: 2900 },
  },
  {
    id: uuidFromNumber(2014),
    externalId: "bank-2026-04-014",
    postedAt: "2026-04-12",
    description: `${invoiceAt(16).invoiceNumber}`,
    counterparty: "Summit Retail Group",
    amountCents: invoiceAt(16).amountCents + 5000,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2015),
    externalId: "bank-2026-04-015",
    postedAt: "2026-04-13",
    description: "payment from JCloud april services",
    counterparty: "JCloud",
    amountCents: invoiceAt(20).amountCents,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2016),
    externalId: "bank-2026-04-016",
    postedAt: "2026-04-14",
    description: "ACH CCD SETTLEMENT 7718",
    counterparty: "ACH Transfer",
    amountCents: invoiceAt(21).amountCents,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2017),
    externalId: "bank-2026-04-017",
    postedAt: "2026-04-15",
    description: `refund ${invoiceAt(22).invoiceNumber}`,
    counterparty: "Maple Robotics",
    amountCents: -75000,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2018),
    externalId: "bank-2026-04-018",
    postedAt: "2026-04-16",
    description: "AWS bill",
    counterparty: "Amazon Web Services",
    amountCents: -183420,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2019),
    externalId: "bank-2026-04-019",
    postedAt: "2026-04-17",
    description: `${invoiceAt(1).invoiceNumber} second transfer`,
    counterparty: "Northstar Bio",
    amountCents: invoiceAt(1).amountCents + 100,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2020),
    externalId: "bank-2026-04-020",
    postedAt: "2026-04-18",
    description: "LOCKBOX 48291 CUSTOMER PAYMENT",
    counterparty: "Bank Lockbox",
    amountCents: invoiceAt(24).amountCents,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2021),
    externalId: "bank-2026-04-021",
    postedAt: "2026-04-19",
    description: "CARD SETTLEMENT BATCH 481",
    counterparty: "Adyen",
    amountCents: invoiceAt(25).amountCents + invoiceAt(26).amountCents - 4300,
    currency: "USD",
    rawPayload: { source: "seed", feeCents: 4300 },
  },
  {
    id: uuidFromNumber(2022),
    externalId: "bank-2026-04-022",
    postedAt: "2026-04-20",
    description: "WIRE INCOMING OPERATIONS",
    counterparty: "Unknown Sender",
    amountCents: 512300,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2023),
    externalId: "bank-2026-04-023",
    postedAt: "2026-04-21",
    description: "payroll provider debit",
    counterparty: "Gusto",
    amountCents: -745000,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
  {
    id: uuidFromNumber(2024),
    externalId: "bank-2026-04-024",
    postedAt: "2026-04-22",
    description: "customer credit applied",
    counterparty: "Bluebird",
    amountCents: 84000,
    currency: "USD",
    rawPayload: { source: "seed" },
  },
] satisfies BankTransactionInsert[];

const generatedTransactions = Array.from({
  length: 60,
}).map((_, index) => {
  const customer = seedCustomers[index % seedCustomers.length];
  const amount = 95000 + ((index * 37300) % 760000);
  const signedAmount = index % 5 === 0 ? -amount : amount;

  return {
    id: uuidFromNumber(2030 + index),
    externalId: `bank-2026-05-${String(index + 1).padStart(3, "0")}`,
    postedAt: `2026-05-${String((index % 28) + 1).padStart(2, "0")}`,
    description:
      index % 5 === 0
        ? "vendor debit"
        : index % 4 === 0
          ? "incoming ach corporate payment"
          : `payment ${customer.aliases?.[0] ?? customer.name}`,
    counterparty:
      index % 5 === 0
        ? "Operating Vendor"
        : customer.aliases?.[0] ?? customer.name,
    amountCents: signedAmount,
    currency: "USD",
    rawPayload: { source: "seed", generated: true, index },
  };
}) satisfies BankTransactionInsert[];

export const seedBankTransactions = [
  ...aprilTransactions,
  ...scenarioTransactions,
  ...generatedTransactions,
] satisfies BankTransactionInsert[];
