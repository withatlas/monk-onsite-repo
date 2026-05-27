"use client";

import { Play, Upload } from "lucide-react";
import { useRef, useState } from "react";

export function OperationsPanel() {
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <form
          action={uploadTransactions}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
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
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            disabled={busy}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-[#166534] px-4 text-sm font-medium text-white disabled:opacity-60"
            type="button"
            onClick={runMatching}
          >
            <Play size={16} aria-hidden="true" />
            Match
          </button>
          {message ? <p className="text-sm text-[#697386]">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}
