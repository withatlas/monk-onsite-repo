import {
  bankTransactions,
  customers,
  invoices,
  matchResults,
  matchRuns,
} from "@/db/schema";
import { seedCustomers, seedInvoices } from "@/db/seed-data";
import { db } from "@/domains/platform/infra/db/baseClient";

export async function resetAndSeedCashApplicationData() {
  await db.delete(matchResults);
  await db.delete(matchRuns);
  await db.delete(bankTransactions);
  await db.delete(invoices);
  await db.delete(customers);

  await db.insert(customers).values(seedCustomers);
  await db.insert(invoices).values(seedInvoices);

  return {
    customerCount: seedCustomers.length,
    invoiceCount: seedInvoices.length,
    transactionCount: 0,
  };
}
