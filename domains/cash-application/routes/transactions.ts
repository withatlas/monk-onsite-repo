import { CsvTransactionImportService } from "@/domains/cash-application/services/csv-transaction-import.service";

type UploadCsvOptions = {
  replace?: boolean;
};

export class TransactionRoutes {
  static async uploadCsv(
    formData: FormData,
    options: UploadCsvOptions = {},
  ) {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new Error("CSV file is required");
    }

    const contents = await file.text();
    return options.replace
      ? CsvTransactionImportService.replaceCsv(contents)
      : CsvTransactionImportService.importCsv(contents);
  }
}
