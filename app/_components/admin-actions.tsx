"use client";

import { AlertTriangle, DatabaseZap, RotateCcw, ShieldAlert } from "lucide-react";
import { useState } from "react";

type AdminResetAction = "data" | "schema";

const resetConfirmation = "monk-onsite-repo";

export function AdminActions() {
  const [open, setOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<AdminResetAction | null>(null);
  const [message, setMessage] = useState("");

  async function runReset(action: AdminResetAction) {
    const label =
      action === "schema" ? "reset DB data and schema" : "reset DB data";
    const confirmed = window.confirm(
      `Admin only: ${label}. Do not touch during an interview. Continue?`,
    );

    if (!confirmed) return;

    setBusyAction(action);
    setMessage("");

    try {
      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, confirmation: resetConfirmation }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Admin reset failed");
      }

      setMessage("Reset complete");
      window.location.assign("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="relative">
      <button
        className="inline-flex h-8 items-center gap-1 rounded-md border border-[#d9ded7] bg-white px-2 text-xs font-medium text-[#697386] hover:bg-[#f2f4f0]"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <ShieldAlert size={14} aria-hidden="true" />
        Admin
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-[#d9ded7] bg-white p-3 shadow-lg">
          <div className="mb-3 flex gap-2 rounded-md border border-[#f0b4aa] bg-[#fff4f2] p-2 text-xs text-[#b42318]">
            <AlertTriangle
              className="mt-0.5 shrink-0"
              size={15}
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold">Interviewer/admin only</div>
              <div>Do not touch during an active interview.</div>
            </div>
          </div>
          <div className="grid gap-2">
            <button
              disabled={busyAction !== null}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9ded7] bg-white px-3 text-left text-sm font-medium text-[#1f2933] hover:bg-[#f2f4f0] disabled:opacity-60"
              type="button"
              onClick={() => runReset("data")}
            >
              <RotateCcw size={15} aria-hidden="true" />
              {busyAction === "data" ? "Resetting..." : "Reset DB data"}
            </button>
            <button
              disabled={busyAction !== null}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#b42318] px-3 text-left text-sm font-medium text-white disabled:opacity-60"
              type="button"
              onClick={() => runReset("schema")}
            >
              <DatabaseZap size={15} aria-hidden="true" />
              {busyAction === "schema"
                ? "Resetting..."
                : "Reset DB data and schema"}
            </button>
          </div>
          {message ? (
            <p className="mt-3 text-xs text-[#697386]">{message}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
