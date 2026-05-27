import { asc, count, desc, eq } from "drizzle-orm";

import {
  customers,
  invoices,
  type Customer,
  type Invoice,
  type InvoiceInsert,
} from "@/db/schema";
import {
  db,
  handleError,
  type TransactionType,
} from "@/domains/platform/infra/db/baseClient";

export type InvoiceWithCustomer = {
  invoice: Invoice;
  customer: Customer;
};

export class InvoiceDao {
  static async create(
    data: InvoiceInsert,
    tx: TransactionType = db
  ): Promise<Invoice> {
    try {
      const [created] = await tx.insert(invoices).values(data).returning();
      return created;
    } catch (error) {
      handleError(error, "InvoiceDao.create");
    }
  }

  static async createMany(
    rows: InvoiceInsert[],
    tx: TransactionType = db
  ): Promise<Invoice[]> {
    try {
      if (rows.length === 0) return [];
      return await tx.insert(invoices).values(rows).returning();
    } catch (error) {
      handleError(error, "InvoiceDao.createMany");
    }
  }

  static async listOpen(tx: TransactionType = db): Promise<Invoice[]> {
    try {
      return await tx
        .select()
        .from(invoices)
        .where(eq(invoices.status, "open"))
        .orderBy(asc(invoices.dueDate));
    } catch (error) {
      handleError(error, "InvoiceDao.listOpen");
    }
  }

  static async listWithCustomers(
    tx: TransactionType = db
  ): Promise<InvoiceWithCustomer[]> {
    try {
      const rows = await tx
        .select({ invoice: invoices, customer: customers })
        .from(invoices)
        .innerJoin(customers, eq(invoices.customerId, customers.id))
        .orderBy(desc(invoices.issueDate), asc(invoices.invoiceNumber));

      return rows;
    } catch (error) {
      handleError(error, "InvoiceDao.listWithCustomers");
    }
  }

  static async count(tx: TransactionType = db): Promise<number> {
    try {
      const [row] = await tx.select({ value: count() }).from(invoices);
      return row?.value ?? 0;
    } catch (error) {
      handleError(error, "InvoiceDao.count");
    }
  }
}
