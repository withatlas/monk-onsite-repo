import { CsvTransactionImportService } from "@/domains/cash-application/services/csv-transaction-import.service";

export class TransactionRoutes {
  static async uploadCsv(formData: FormData) {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new Error("CSV file is required");
    }

    const contents = await file.text();
    return CsvTransactionImportService.importCsv(contents);
  }
}
