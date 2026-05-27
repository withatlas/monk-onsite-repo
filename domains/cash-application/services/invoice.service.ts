import {
  createInvoiceInputSchema,
  type Invoice,
  type InvoiceInsert,
} from "@/db/schema";
import {
  InvoiceDao,
  type InvoiceWithCustomer,
} from "@/domains/cash-application/dao/invoice.dao";

export class InvoiceService {
  static async createInvoice(input: InvoiceInsert): Promise<Invoice> {
    const parsed = createInvoiceInputSchema.parse(input);
    return InvoiceDao.create({ ...parsed, status: "open" });
  }

  static async listInvoices(): Promise<InvoiceWithCustomer[]> {
    return InvoiceDao.listWithCustomers();
  }
}
