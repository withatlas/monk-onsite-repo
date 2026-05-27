import { InvoiceRoutes } from "@/domains/cash-application/routes/invoices";
import { InvoiceService } from "@/domains/cash-application/services/invoice.service";
import { jsonError } from "@/lib/http";

export async function GET() {
  try {
    const invoices = await InvoiceService.listInvoices();
    return Response.json({ invoices });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const invoice = await InvoiceRoutes.create(await request.json());
    return Response.json({ invoice }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
