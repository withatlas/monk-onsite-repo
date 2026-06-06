"use client";

import { Play, RefreshCw } from "lucide-react";
import { useState } from "react";

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
  const canMatch = transactionCount > 0;
  const matchLabel = hasMatchRun ? "Run match again" : "Run match";

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
        <div>
          <h2 className="text-sm font-semibold">Match imported transactions</h2>
          <p className="mt-1 max-w-2xl text-sm text-[#697386]">
            {canMatch
              ? `You can run match as many times as you'd like against the existing ${transactionCount} imported transactions.`
              : "Upload transactions from the Transactions tab first. After upload, you can run match as many times as you'd like against the existing transactions."}
          </p>
          {message ? (
            <p className="mt-2 text-sm text-[#697386]">{message}</p>
          ) : null}
        </div>
        <div>
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
        </div>
      </div>
    </section>
  );
}
