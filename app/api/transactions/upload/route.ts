import { TransactionRoutes } from "@/domains/cash-application/routes/transactions";
import { jsonError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const transactions = await TransactionRoutes.uploadCsv(
      await request.formData(),
      { replace: url.searchParams.get("replace") === "true" },
    );

    return Response.json({ transactions }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
