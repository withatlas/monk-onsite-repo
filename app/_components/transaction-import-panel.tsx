"use client";

import { RefreshCw, Upload } from "lucide-react";
import { useRef, useState } from "react";

type TransactionImportPanelProps = {
  transactionCount: number;
};

export function TransactionImportPanel({
  transactionCount,
}: TransactionImportPanelProps) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasTransactions = transactionCount > 0;

  async function uploadTransactions(formData: FormData) {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/transactions/upload${hasTransactions ? "?replace=true" : ""}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Upload failed");

      setMessage(
        hasTransactions
          ? "Transactions replaced"
          : "Transactions uploaded",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      window.location.assign("/?view=transactions");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      action={uploadTransactions}
      className="rounded-lg border border-[#d9ded7] bg-[#f7f7f4] p-4"
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold">
          {hasTransactions ? "Replace transactions" : "Import transactions"}
        </h3>
        <p className="mt-1 text-sm text-[#697386]">
          {hasTransactions
            ? `${transactionCount} transactions are imported. Choose a CSV to delete the current set and import the new export.`
            : "Choose the bank transaction export CSV to start matching."}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={fileInputRef}
          name="file"
          type="file"
          accept=".csv,text/csv"
          className="h-10 min-w-[280px] rounded-md border border-[#cbd5c8] bg-white px-3 py-2 text-sm"
          required
        />
        <button
          disabled={busy}
          className={`inline-flex h-10 w-fit items-center gap-2 rounded-md px-4 text-sm font-medium text-white disabled:opacity-60 ${
            hasTransactions ? "bg-[#b42318]" : "bg-[#1d4ed8]"
          }`}
          type="submit"
        >
          {hasTransactions ? (
            <RefreshCw size={16} aria-hidden="true" />
          ) : (
            <Upload size={16} aria-hidden="true" />
          )}
          {hasTransactions ? "Delete and reupload" : "Upload CSV"}
        </button>
      </div>
      {message ? (
        <p className="mt-3 text-sm text-[#697386]">{message}</p>
      ) : null}
    </form>
  );
}
