import { TransactionRoutes } from "@/domains/cash-application/routes/transactions";
import { jsonError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const transactions = await TransactionRoutes.uploadCsv(
      await request.formData()
    );

    return Response.json({ transactions }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
