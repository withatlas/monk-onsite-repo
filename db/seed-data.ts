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
