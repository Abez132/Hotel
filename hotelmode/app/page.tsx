"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  value: string;
  label: string;
  excelName?: string;
  price: number;
};

const fallbackProducts: Product[] = [
  { value: "beer", label: "Beer", price: 86.95 },
  {
    value: "room-standard",
    label: "Room Standard",
    excelName: "Room",
    price: 695.65,
  },
  {
    value: "room-deluxe",
    label: "Room Deluxe",
    excelName: "Room",
    price: 347.82,
  },
  {
    value: "double-bed",
    label: "Double bed",
    excelName: "Double bed",
    price: 1043.47,
  },
];

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [popup, setPopup] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      return;
    }
    if (savedTheme === "light") {
      setIsDark(false);
      return;
    }
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!popup) return;
    const timer = window.setTimeout(() => setPopup(null), 9000);
    return () => window.clearTimeout(timer);
  }, [popup]);

  useEffect(() => {
    let cancelled = false;
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const payload = await response.json();
        if (!response.ok)
          throw new Error(
            payload?.error || payload?.message || "Failed to load products",
          );
        if (
          !cancelled &&
          Array.isArray(payload.products) &&
          payload.products.length > 0
        )
          setProducts(payload.products);
      } catch {
        if (!cancelled) setProducts(fallbackProducts);
      }
    };
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formDataObj = new FormData(form);
    const formData = {
      fs: String(formDataObj.get("fs") ?? ""),
      goods: String(formDataObj.get("goods") ?? ""),
      amount: String(formDataObj.get("amount") ?? ""),
    };
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMessage =
          typeof payload?.error === "string"
            ? payload.error
            : typeof payload?.message === "string"
              ? payload.message
              : "Failed to save data.";
        setPopup({ type: "error", message: errorMessage });
        return;
      }
      setPopup({
        type: "success",
        message: payload?.data
          ? `Saved: ${payload.data.fs}, ${payload.data.goods}, ${payload.data.amount}`
          : "Saved!",
      });
      const fsValue = formData.fs;
      form.reset();
      const fsField = form.elements.namedItem("fs");
      if (fsField instanceof HTMLInputElement) fsField.value = fsValue;
    } catch {
      setPopup({ type: "error", message: "Network error while saving data." });
    }
  };

  // ── Palette ─────────────────────────────────────────────────────────────────
  // #050814  deepest bg          #101522  dark navy
  // #1f2937  dark gray-blue      #6b7280  slate gray (muted / borders)
  // #f9fafb  near-white text
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside
        className={`relative w-72 overflow-hidden px-5 py-8 transition-colors duration-300 ${
          isDark ? "bg-[#101522] text-[#f9fafb]" : "bg-[#f9fafb] text-[#1f2937]"
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
        >
          Hotel mode
        </p>
        <h2 className="mt-3 text-2xl font-extrabold">Receipt entry</h2>
        <p
          className={`mt-3 text-sm ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
        >
          Save guest bill data into Excel and maintain the product catalog from
          a separate page.
        </p>

        <Link
          href="/products"
          className={`mt-6 inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-[#f9fafb] transition hover:-translate-y-0.5 ${
            isDark
              ? "bg-[#1f2937] hover:bg-[#374151]"
              : "bg-[#1f2937] hover:bg-[#374151]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M7 8h10M7 12h10" />
          </svg>
          Manage products
        </Link>

        <div
          className={`mt-8 rounded-2xl border p-4 ${
            isDark
              ? "border-[#1f2937] bg-[#050814]"
              : "border-[#e5e7eb] bg-white"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
          >
            Products
          </p>
          <div className="mt-3 max-h-[60vh] space-y-2 overflow-auto pr-1">
            {products.map((product) => (
              <div
                key={product.label}
                className={`rounded-xl px-3 py-2 text-sm ${
                  isDark ? "bg-[#1f2937]" : "bg-[#f3f4f6]"
                }`}
              >
                <div className="font-semibold">{product.label}</div>
                <div className={isDark ? "text-[#6b7280]" : "text-[#6b7280]"}>
                  Price: {product.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main
        className={`relative flex-1 overflow-hidden px-4 py-8 transition-colors duration-300 sm:px-8 sm:py-12 ${
          isDark
            ? "bg-linear-to-b from-[#050814] via-[#101522] to-[#050814]"
            : "bg-linear-to-b from-[#f9fafb] via-[#f3f4f6] to-[#f9fafb]"
        }`}
      >
        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className={`absolute right-4 top-4 z-40 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition sm:right-8 sm:top-8 ${
            isDark
              ? "border-[#1f2937] bg-[#101522] text-[#f9fafb] hover:bg-[#1f2937]"
              : "border-[#e5e7eb] bg-white/90 text-[#1f2937] hover:bg-white"
          }`}
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
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>

        {/* Popup */}
        {popup ? (
          <div
            className={`fixed left-1/2 top-5 z-50 w-[min(92vw,28rem)] -translate-x-1/2 animate-rise-in rounded-2xl border p-3 shadow-[0_12px_40px_rgba(5,8,20,0.5)] backdrop-blur ${
              isDark
                ? "border-[#1f2937] bg-[#101522]/95"
                : "border-[#e5e7eb] bg-white/95"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 h-2.5 w-2.5 rounded-full ${popup.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
              />
              <p
                className={`flex-1 text-sm font-medium ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
              >
                {popup.message}
              </p>
              <button
                type="button"
                aria-label="Close popup"
                onClick={() => setPopup(null)}
                className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                  isDark
                    ? "text-[#6b7280] hover:bg-[#1f2937]"
                    : "text-[#6b7280] hover:bg-[#f3f4f6]"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}

        {/* Ambient blobs */}
        <div
          className={`pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full blur-3xl animate-float-slow will-change-transform ${isDark ? "bg-[#1f2937]/60" : "bg-[#6b7280]/15"}`}
        />
        <div
          className={`pointer-events-none absolute -right-12 top-1/3 h-64 w-64 rounded-full blur-3xl animate-float-delayed will-change-transform ${isDark ? "bg-[#101522]/80" : "bg-[#6b7280]/10"}`}
        />
        <div
          className={`pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl animate-float-slow will-change-transform ${isDark ? "bg-[#1f2937]/40" : "bg-[#6b7280]/10"}`}
        />

        {/* Card */}
        <section
          className={`mx-auto w-full max-w-3xl animate-rise-in rounded-3xl border p-6 shadow-[0_20px_60px_rgba(5,8,20,0.5)] backdrop-blur md:p-10 ${
            isDark
              ? "border-[#1f2937] bg-[#101522]/90"
              : "border-[#e5e7eb] bg-white/90"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
          >
            Hotel Transnvenia
          </p>
          <h1
            className={`mt-2 text-balance text-3xl font-extrabold leading-tight sm:text-4xl ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
          >
            Quick Guest Entry
          </h1>
          <p
            className={`mt-2 max-w-xl text-sm sm:text-base ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
          >
            Capture essential guest details and store them in Excel.
          </p>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span
                className={`text-sm font-semibold ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
              >
                Fs
              </span>
              <input
                name="fs"
                required
                className={`h-12 rounded-xl border px-4 outline-none transition focus:ring-4 ${
                  isDark
                    ? "border-[#1f2937] bg-[#050814] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#6b7280] focus:ring-[#6b7280]/20"
                    : "border-[#e5e7eb] bg-white text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#6b7280] focus:ring-[#6b7280]/15"
                }`}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span
                  className={`text-sm font-semibold ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
                >
                  Package
                </span>
                <select
                  name="goods"
                  required
                  className={`h-12 rounded-xl border px-4 outline-none transition focus:ring-4 ${
                    isDark
                      ? "border-[#1f2937] bg-[#050814] text-[#f9fafb] focus:border-[#6b7280] focus:ring-[#6b7280]/20"
                      : "border-[#e5e7eb] bg-white text-[#1f2937] focus:border-[#6b7280] focus:ring-[#6b7280]/15"
                  }`}
                >
                  {products.map((product) => (
                    <option key={product.value} value={product.value}>
                      {product.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span
                  className={`text-sm font-semibold ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
                >
                  Amount
                </span>
                <select
                  name="amount"
                  className={`h-12 rounded-xl border px-4 outline-none transition focus:ring-4 ${
                    isDark
                      ? "border-[#1f2937] bg-[#050814] text-[#f9fafb] focus:border-[#6b7280] focus:ring-[#6b7280]/20"
                      : "border-[#e5e7eb] bg-white text-[#1f2937] focus:border-[#6b7280] focus:ring-[#6b7280]/15"
                  }`}
                >
                  {[...Array(50)].map((_, index) => (
                    <option key={index} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              className={`mt-2 inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-[#f9fafb] shadow-[0_12px_24px_rgba(5,8,20,0.4)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#6b7280]/30 ${
                isDark
                  ? "bg-[#1f2937] hover:bg-[#374151]"
                  : "bg-[#1f2937] hover:bg-[#374151]"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
                <path d="M7 6v12" />
              </svg>
              Save Entry
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
