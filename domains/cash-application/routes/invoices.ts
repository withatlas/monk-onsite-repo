import { z } from "zod";

import { InvoiceService } from "@/domains/cash-application/services/invoice.service";
import { dollarsToCents } from "@/lib/money";

export const createInvoiceRequestSchema = z.object({
  customerId: z.string().uuid(),
  invoiceNumber: z.string().min(3).max(64),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.string().min(1),
  currency: z.string().length(3).default("USD"),
  memo: z.string().optional(),
});

export class InvoiceRoutes {
  static async create(body: unknown) {
    const input = createInvoiceRequestSchema.parse(body);

    return InvoiceService.createInvoice({
      customerId: input.customerId,
      invoiceNumber: input.invoiceNumber,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      amountCents: dollarsToCents(input.amount),
      currency: input.currency,
      memo: input.memo,
    });
  }
}
