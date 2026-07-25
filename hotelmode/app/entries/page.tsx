"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Entry = {
  id: number;
  fs: string;
  date: string;
  goods: string;
  amount: number;
  price: number;
  sums: number;
};

export default function EntriesPage() {
  const [isDark, setIsDark] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Entry>>({});
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      return;
    }
    if (saved === "light") {
      setIsDark(false);
      return;
    }
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 5000);
    return () => window.clearTimeout(t);
  }, [message]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/entries");
      const payload = await res.json();
      if (!res.ok)
        throw new Error(payload?.message ?? "Failed to load entries");
      setEntries(Array.isArray(payload.entries) ? payload.entries : []);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load entries",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditDraft({
      fs: entry.fs,
      date: entry.date,
      goods: entry.goods,
      amount: entry.amount,
      price: entry.price,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch("/api/entries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editDraft }),
      });
      const payload = await res.json();
      if (!res.ok)
        throw new Error(payload?.message ?? "Failed to update entry");
      setEntries((prev) => prev.map((e) => (e.id === id ? payload.entry : e)));
      setEditingId(null);
      setEditDraft({});
      setMessage({ type: "success", text: "Entry updated." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update entry",
      });
    }
  };

  const deleteEntry = async (id: number) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const res = await fetch("/api/entries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await res.json();
      if (!res.ok)
        throw new Error(payload?.message ?? "Failed to delete entry");
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setMessage({ type: "success", text: "Entry deleted." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete entry",
      });
    }
  };

  const downloadExcel = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/download");
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.href = url;
      a.download = match?.[1] ?? "entries.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Download failed",
      });
    } finally {
      setDownloading(false);
    }
  };

  const inputCls = `h-9 w-full rounded-lg border px-2 text-sm outline-none transition focus:ring-2 ${
    isDark
      ? "border-[#1f2937] bg-[#050814] text-[#f9fafb] focus:border-[#6b7280] focus:ring-[#6b7280]/20"
      : "border-[#e5e7eb] bg-white text-[#1f2937] focus:border-[#6b7280] focus:ring-[#6b7280]/15"
  }`;

  return (
    <div
      className={`relative min-h-screen transition-colors duration-300 ${isDark ? "bg-[#050814]" : "bg-[#f9fafb]"}`}
    >
      {/* ── Top bar ── */}
      <div
        className={`sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur sm:px-8 ${isDark ? "border-[#1f2937] bg-[#050814]/90" : "border-[#e5e7eb] bg-white/90"}`}
      >
        <Link
          href="/"
          className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${isDark ? "border-[#1f2937] bg-[#101522] text-[#f9fafb] hover:bg-[#1f2937]" : "border-[#e5e7eb] bg-white text-[#1f2937] hover:bg-[#f3f4f6]"}`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </Link>

        <p
          className={`hidden text-xs font-semibold uppercase tracking-[0.2em] sm:block ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
        >
          Hotel mode · Entries
        </p>

        <div className="flex items-center gap-2">
          {/* Download Excel */}
          <button
            type="button"
            onClick={downloadExcel}
            disabled={downloading}
            className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition disabled:opacity-50 ${isDark ? "border-[#1f2937] bg-[#101522] text-[#f9fafb] hover:bg-[#1f2937]" : "border-[#e5e7eb] bg-white text-[#1f2937] hover:bg-[#f3f4f6]"}`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`h-4 w-4 ${downloading ? "animate-bounce" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="hidden sm:inline">
              {downloading ? "Generating…" : "Download Excel"}
            </span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setIsDark((p) => !p)}
            className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${isDark ? "border-[#1f2937] bg-[#101522] text-[#f9fafb] hover:bg-[#1f2937]" : "border-[#e5e7eb] bg-white/90 text-[#1f2937] hover:bg-white"}`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isDark ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </>
              ) : (
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 py-8 sm:px-8">
        <section
          className={`mx-auto w-full max-w-6xl rounded-3xl border p-6 shadow-[0_20px_60px_rgba(5,8,20,0.4)] md:p-10 ${isDark ? "border-[#1f2937] bg-[#101522]/90" : "border-[#e5e7eb] bg-white/90"}`}
        >
          <h1
            className={`text-3xl font-extrabold ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
          >
            All Entries
          </h1>
          <p
            className={`mt-1 text-sm ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
          >
            {entries.length} record{entries.length !== 1 ? "s" : ""} · click a
            row to edit
          </p>

          {/* Toast */}
          {message && (
            <div
              className={`mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${message.type === "success" ? (isDark ? "border-emerald-800/50 bg-emerald-900/20 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-900") : isDark ? "border-rose-800/50 bg-rose-900/20 text-rose-400" : "border-rose-200 bg-rose-50 text-rose-900"}`}
            >
              <div
                className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${message.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
              />
              <span className="flex-1">{message.text}</span>
              <button
                type="button"
                onClick={() => setMessage(null)}
                className="shrink-0 rounded px-1.5 py-0.5 text-xs opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Table */}
          <div
            className={`mt-6 overflow-x-auto rounded-2xl border ${isDark ? "border-[#1f2937]" : "border-[#e5e7eb]"}`}
          >
            {/* Header */}
            <div
              className={`grid grid-cols-[1fr_1fr_1.5fr_0.7fr_0.8fr_0.8fr_auto] gap-2 border-b px-4 py-3 text-xs font-semibold uppercase tracking-widest ${isDark ? "border-[#1f2937] bg-[#050814]/80 text-[#6b7280]" : "border-[#e5e7eb] bg-[#f3f4f6] text-[#6b7280]"}`}
            >
              <span>FS</span>
              <span>Date</span>
              <span>Product</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
              <span className="sr-only">Actions</span>
            </div>

            {/* Rows */}
            <div
              className={`divide-y ${isDark ? "divide-[#1f2937]" : "divide-[#f3f4f6]"}`}
            >
              {loading ? (
                <div className="px-4 py-12 text-center text-sm text-[#6b7280]">
                  Loading…
                </div>
              ) : entries.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-[#6b7280]">
                  No entries yet.
                </div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-[1fr_1fr_1.5fr_0.7fr_0.8fr_0.8fr_auto] items-center gap-2 px-4 py-3 text-sm transition ${isDark ? "hover:bg-[#1f2937]/30" : "hover:bg-[#f9fafb]"}`}
                  >
                    {editingId === entry.id ? (
                      <>
                        <input
                          value={editDraft.fs ?? ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, fs: e.target.value }))
                          }
                          className={inputCls}
                        />
                        <input
                          value={editDraft.date ?? ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              date: e.target.value,
                            }))
                          }
                          className={inputCls}
                        />
                        <input
                          value={editDraft.goods ?? ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              goods: e.target.value,
                            }))
                          }
                          className={inputCls}
                        />
                        <input
                          value={editDraft.amount ?? ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              amount: parseInt(e.target.value) || 0,
                            }))
                          }
                          type="number"
                          min="1"
                          className={inputCls}
                        />
                        <input
                          value={editDraft.price ?? ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              price: parseFloat(e.target.value) || 0,
                            }))
                          }
                          type="number"
                          step="0.01"
                          className={inputCls}
                        />
                        <span
                          className={`text-xs ${isDark ? "text-[#6b7280]" : "text-[#9ca3af]"}`}
                        >
                          {(
                            (editDraft.price ?? 0) * (editDraft.amount ?? 0)
                          ).toFixed(2)}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => saveEdit(entry.id)}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${isDark ? "border-[#1f2937] text-[#6b7280] hover:bg-[#1f2937]" : "border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6]"}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span
                          className={`font-semibold ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
                        >
                          {entry.fs}
                        </span>
                        <span
                          className={
                            isDark ? "text-[#6b7280]" : "text-[#6b7280]"
                          }
                        >
                          {entry.date}
                        </span>
                        <span
                          className={
                            isDark ? "text-[#f9fafb]" : "text-[#1f2937]"
                          }
                        >
                          {entry.goods}
                        </span>
                        <span
                          className={
                            isDark ? "text-[#6b7280]" : "text-[#6b7280]"
                          }
                        >
                          {entry.amount}
                        </span>
                        <span
                          className={
                            isDark ? "text-[#6b7280]" : "text-[#6b7280]"
                          }
                        >
                          {entry.price.toFixed(2)}
                        </span>
                        <span
                          className={`font-semibold ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
                        >
                          {entry.sums.toFixed(2)}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(entry)}
                            aria-label="Edit"
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${isDark ? "border-[#1f2937] text-[#6b7280] hover:bg-[#1f2937]" : "border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6]"}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            aria-label="Delete"
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${isDark ? "border-rose-900/50 bg-rose-900/10 text-rose-400 hover:bg-rose-900/30" : "border-rose-200 text-rose-700 hover:bg-rose-50"}`}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
