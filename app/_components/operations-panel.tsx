"use client";

import { Play, Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";

import type { Customer } from "@/db/schema";

type OperationsPanelProps = {
  customers: Customer[];
};

export function OperationsPanel({ customers }: OperationsPanelProps) {
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function createInvoice(formData: FormData) {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (!response.ok) throw new Error("Invoice create failed");

      setMessage("Invoice created");
      window.location.assign("/?view=invoices");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

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
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-5 lg:grid-cols-[1.2fr_1fr_220px]">
        <form action={createInvoice} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <select
              name="customerId"
              className="h-10 rounded-md border border-[#cbd5c8] bg-white px-3"
              required
              defaultValue={customers[0]?.id ?? ""}
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <input
              name="invoiceNumber"
              className="h-10 rounded-md border border-[#cbd5c8] px-3"
              placeholder="Invoice number"
              required
            />
            <input
              name="amount"
              className="h-10 rounded-md border border-[#cbd5c8] px-3"
              placeholder="Amount"
              required
            />
            <input
              name="issueDate"
              type="date"
              className="h-10 rounded-md border border-[#cbd5c8] px-3"
              required
            />
            <input
              name="dueDate"
              type="date"
              className="h-10 rounded-md border border-[#cbd5c8] px-3"
              required
            />
            <input
              name="memo"
              className="h-10 rounded-md border border-[#cbd5c8] px-3"
              placeholder="Memo"
            />
          </div>
          <button
            disabled={busy || customers.length === 0}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-[#1f2933] px-4 text-sm font-medium text-white disabled:opacity-60"
            type="submit"
          >
            <Plus size={16} aria-hidden="true" />
            Create invoice
          </button>
        </form>

        <form action={uploadTransactions} className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="h-10 rounded-md border border-[#cbd5c8] bg-white px-3 py-2 text-sm"
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

        <div className="flex flex-col gap-3">
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
