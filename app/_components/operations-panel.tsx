"use client";

import { Play, RefreshCw, Upload } from "lucide-react";
import { useRef, useState } from "react";

type OperationsPanelProps = {
  transactionCount: number;
  hasMatchRun: boolean;
};

export function OperationsPanel({
  transactionCount,
  hasMatchRun,
}: OperationsPanelProps) {
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canMatch = transactionCount > 0;
  const matchLabel = hasMatchRun ? "Run match again" : "Run match";

  async function uploadTransactions(formData: FormData) {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/transactions/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      setMessage("Transactions uploaded");
      if (fileInputRef.current) fileInputRef.current.value = "";
      window.location.assign("/?view=transactions");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function runMatching() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/match-runs", { method: "POST" });

      if (!response.ok) throw new Error("Match run failed");

      setMessage("Match run completed");
      window.location.assign("/?view=matches");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-y border-[#d9ded7] bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <form
          action={uploadTransactions}
          className="rounded-lg border border-[#d9ded7] bg-[#f7f7f4] p-4"
        >
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Import transactions</h2>
            <p className="mt-1 text-sm text-[#697386]">
              Add a bank transaction export to the current workspace.
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
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-[#1d4ed8] px-4 text-sm font-medium text-white disabled:opacity-60"
              type="submit"
            >
              <Upload size={16} aria-hidden="true" />
              Upload CSV
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-[#d9ded7] bg-[#f7f7f4] p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Match imported transactions</h2>
            <p className="mt-1 text-sm text-[#697386]">
              {canMatch
                ? `${transactionCount} imported transactions are ready. Matching can be rerun without uploading again.`
                : "Upload transactions before running a match."}
            </p>
          </div>
          <button
            disabled={busy || !canMatch}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-[#166534] px-4 text-sm font-medium text-white disabled:opacity-60"
            type="button"
            onClick={runMatching}
          >
            {hasMatchRun ? (
              <RefreshCw size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
            {matchLabel}
          </button>
          {message ? (
            <p className="mt-3 text-sm text-[#697386]">{message}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
