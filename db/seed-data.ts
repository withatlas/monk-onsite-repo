import type { CustomerInsert, InvoiceInsert } from "@/db/schema";

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

const invoiceMemoOverrides = new Map<number, string>([
  [43, "Legal counsel workflow subscription"],
  [46, "Bioscience lab analytics renewal"],
  [53, "Energy operations platform renewal"],
  [56, "Food distribution analytics subscription"],
]);

export const seedCustomers = customerRows.map(
  ([name, externalRef, aliases], index) => ({
    id: uuidFromNumber(index + 1),
    name,
    externalRef,
    aliases: [...aliases],
  })
) satisfies CustomerInsert[];

const baseSeedInvoices = Array.from({ length: 60 }).map((_, index) => {
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
    memo:
      invoiceMemoOverrides.get(index) ??
      `Subscription services for ${issueDate.slice(0, 7)}`,
  };
}) satisfies InvoiceInsert[];

const lateGameInvoices = [
  {
    id: uuidFromNumber(2001),
    customerId: seedCustomers[1]!.id,
    invoiceNumber: "INV-2026-2001",
    issueDate: "2026-06-01",
    dueDate: "2026-07-01",
    status: "open",
    amountCents: 612300,
    currency: "USD",
    memo: "Bioscience lab data migration and compliance renewal",
  },
  {
    id: uuidFromNumber(2002),
    customerId: seedCustomers[2]!.id,
    invoiceNumber: "INV-2026-2002",
    issueDate: "2026-06-01",
    dueDate: "2026-07-01",
    status: "open",
    amountCents: 500000,
    currency: "USD",
    memo: "Analytics workspace annual renewal",
  },
  {
    id: uuidFromNumber(2003),
    customerId: seedCustomers[4]!.id,
    invoiceNumber: "INV-2026-2003",
    issueDate: "2026-06-02",
    dueDate: "2026-07-02",
    status: "open",
    amountCents: 700000,
    currency: "USD",
    memo: "Provider reporting module renewal",
  },
  {
    id: uuidFromNumber(2004),
    customerId: seedCustomers[8]!.id,
    invoiceNumber: "INV-2026-2004",
    issueDate: "2026-06-03",
    dueDate: "2026-07-03",
    status: "open",
    amountCents: 483900,
    currency: "USD",
    memo: "Grid monitoring platform renewal contract arc-grid-26",
  },
  {
    id: uuidFromNumber(2005),
    customerId: seedCustomers[0]!.id,
    invoiceNumber: "INV-2026-2005",
    issueDate: "2026-06-04",
    dueDate: "2026-07-04",
    status: "paid",
    amountCents: 355000,
    currency: "USD",
    memo: "Implementation services already settled",
  },
  {
    id: uuidFromNumber(2006),
    customerId: seedCustomers[10]!.id,
    invoiceNumber: "INV-2026-2006",
    issueDate: "2026-06-05",
    dueDate: "2026-07-05",
    status: "open",
    amountCents: 280000,
    currency: "USD",
    memo: "Training platform renewal",
  },
  {
    id: uuidFromNumber(2007),
    customerId: seedCustomers[11]!.id,
    invoiceNumber: "INV-2026-2007",
    issueDate: "2026-06-06",
    dueDate: "2026-07-06",
    status: "open",
    amountCents: 920000,
    currency: "USD",
    memo: "Frozen route analytics annual renewal",
  },
  {
    id: uuidFromNumber(2008),
    customerId: seedCustomers[13]!.id,
    invoiceNumber: "INV-2026-2008",
    issueDate: "2026-06-07",
    dueDate: "2026-07-07",
    status: "open",
    amountCents: 433000,
    currency: "USD",
    memo: "Counsel operations subscription",
  },
] satisfies InvoiceInsert[];

export const seedInvoices = [
  ...baseSeedInvoices,
  ...lateGameInvoices,
] satisfies InvoiceInsert[];
