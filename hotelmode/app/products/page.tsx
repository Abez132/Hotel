"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  value: string;
  label: string;
  excelName?: string;
  price: number;
};

function createEmptyProduct(): Product {
  return { value: "", label: "", excelName: "", price: 0 };
}

export default function ProductsPage() {
  const [isDark, setIsDark] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

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
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 6000);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    let ignore = false;
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const payload = await response.json();
        if (!response.ok)
          throw new Error(
            payload?.error || payload?.message || "Failed to load products",
          );
        if (!ignore)
          setProducts(Array.isArray(payload.products) ? payload.products : []);
      } catch (error) {
        if (!ignore)
          setMessage({
            type: "error",
            text:
              error instanceof Error
                ? error.message
                : "Failed to load products",
          });
      }
    };
    loadProducts();
    return () => {
      ignore = true;
    };
  }, []);

  const updateProduct = (
    index: number,
    field: keyof Product,
    value: string | number,
  ) => {
    setProducts((current) =>
      current.map((product, i) =>
        i === index
          ? {
              ...product,
              [field]:
                field === "price"
                  ? parseFloat(parseFloat(String(value)).toFixed(2))
                  : value,
            }
          : product,
      ),
    );
  };

  const addProduct = () => setProducts((c) => [...c, createEmptyProduct()]);
  const removeProduct = (index: number) =>
    setProducts((c) => c.filter((_, i) => i !== index));

  const saveProducts = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          payload?.error || payload?.message || "Failed to save products",
        );
      setProducts(
        Array.isArray(payload.products) ? payload.products : products,
      );
      setMessage({ type: "success", text: "Products saved successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to save products",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Palette ─────────────────────────────────────────────────────────────────
  // #050814  deepest bg          #101522  dark navy
  // #1f2937  dark gray-blue      #6b7280  slate gray (muted / borders)
  // #f9fafb  near-white text
  // ────────────────────────────────────────────────────────────────────────────

  const inputCls = `h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:ring-4 ${
    isDark
      ? "border-[#1f2937] bg-[#050814] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#6b7280] focus:ring-[#6b7280]/20"
      : "border-[#e5e7eb] bg-white text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#6b7280] focus:ring-[#6b7280]/15"
  }`;

  const SaveIcon = () => (
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
      <path d="M4 4h12l4 4v12H4z" />
      <path d="M8 4v6h8" />
    </svg>
  );

  const SpinIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );

  return (
    <div
      className={`relative min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-linear-to-b from-[#050814] via-[#101522] to-[#050814]"
          : "bg-linear-to-b from-[#f9fafb] via-[#f3f4f6] to-[#f9fafb]"
      }`}
    >
      {/* Ambient blobs */}
      <div
        className={`pointer-events-none fixed -left-20 top-0 h-72 w-72 rounded-full blur-3xl will-change-transform ${isDark ? "bg-[#1f2937]/60" : "bg-[#6b7280]/10"}`}
      />
      <div
        className={`pointer-events-none fixed -right-12 top-1/3 h-64 w-64 rounded-full blur-3xl will-change-transform ${isDark ? "bg-[#101522]/80" : "bg-[#6b7280]/08"}`}
      />
      <div
        className={`pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl will-change-transform ${isDark ? "bg-[#1f2937]/40" : "bg-[#6b7280]/08"}`}
      />

      {/* ── Sticky top bar ── */}
      <div
        className={`sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur sm:px-8 ${
          isDark
            ? "border-[#1f2937] bg-[#050814]/90"
            : "border-[#e5e7eb] bg-white/90"
        }`}
      >
        <Link
          href="/"
          className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
            isDark
              ? "border-[#1f2937] bg-[#101522] text-[#f9fafb] hover:bg-[#1f2937]"
              : "border-[#e5e7eb] bg-white text-[#1f2937] hover:bg-[#f3f4f6]"
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
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </Link>

        <p
          className={`hidden text-xs font-semibold uppercase tracking-[0.2em] sm:block ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
        >
          Hotel mode · Product manager
        </p>

        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
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
          <span className="hidden sm:inline">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
      </div>

      {/* ── Page body ── */}
      <div className="px-4 py-8 sm:px-8 sm:py-10">
        <section
          className={`mx-auto w-full max-w-5xl rounded-3xl border p-6 shadow-[0_20px_60px_rgba(5,8,20,0.5)] backdrop-blur md:p-10 ${
            isDark
              ? "border-[#1f2937] bg-[#101522]/90"
              : "border-[#e5e7eb] bg-white/90"
          }`}
        >
          {/* ── Header ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
              >
                Product manager
              </p>
              <h1
                className={`mt-2 text-3xl font-extrabold ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
              >
                Adjust prices &amp; products
              </h1>
              <p
                className={`mt-2 max-w-xl text-sm ${isDark ? "text-[#6b7280]" : "text-[#6b7280]"}`}
              >
                Update the catalog used by the receipt form. Changes are stored
                in the project data file and reflected on the billing page.
              </p>
            </div>

            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={addProduct}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition hover:-translate-y-0.5 ${
                  isDark
                    ? "border-[#1f2937] bg-[#101522] text-[#f9fafb] hover:bg-[#1f2937]"
                    : "border-[#e5e7eb] bg-white text-[#1f2937] hover:bg-[#f3f4f6]"
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
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add product
              </button>
              <button
                type="button"
                onClick={saveProducts}
                disabled={saving}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#f9fafb] shadow-[0_8px_20px_rgba(5,8,20,0.4)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDark
                    ? "bg-[#1f2937] hover:bg-[#374151]"
                    : "bg-[#1f2937] hover:bg-[#374151]"
                }`}
              >
                {saving ? <SpinIcon /> : <SaveIcon />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>

          {/* ── Toast ── */}
          {message ? (
            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
                message.type === "success"
                  ? isDark
                    ? "border-emerald-800/50 bg-emerald-900/20 text-emerald-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : isDark
                    ? "border-rose-800/50 bg-rose-900/20 text-rose-400"
                    : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              <div
                className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${message.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
              />
              <span className="flex-1">{message.text}</span>
              <button
                type="button"
                onClick={() => setMessage(null)}
                className="shrink-0 rounded px-1.5 py-0.5 text-xs opacity-60 transition hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ) : null}

          {/* ── Stats bar ── */}
          <div
            className={`mt-6 flex flex-wrap items-center gap-6 rounded-2xl border px-5 py-3 ${
              isDark
                ? "border-[#1f2937] bg-[#050814]/60"
                : "border-[#e5e7eb] bg-[#f3f4f6]"
            }`}
          >
            <div>
              <span
                className={`text-lg font-extrabold ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
              >
                {products.length}
              </span>
              <span className="ml-1.5 text-xs uppercase tracking-wide text-[#6b7280]">
                products
              </span>
            </div>
            {products.length > 0 && (
              <>
                <div
                  className={`h-5 w-px ${isDark ? "bg-[#1f2937]" : "bg-[#e5e7eb]"}`}
                />
                <div>
                  <span
                    className={`text-lg font-extrabold ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
                  >
                    {Math.min(...products.map((p) => p.price)).toFixed(2)}
                  </span>
                  <span className="ml-1.5 text-xs uppercase tracking-wide text-[#6b7280]">
                    min price
                  </span>
                </div>
                <div
                  className={`h-5 w-px ${isDark ? "bg-[#1f2937]" : "bg-[#e5e7eb]"}`}
                />
                <div>
                  <span
                    className={`text-lg font-extrabold ${isDark ? "text-[#f9fafb]" : "text-[#1f2937]"}`}
                  >
                    {Math.max(...products.map((p) => p.price)).toFixed(2)}
                  </span>
                  <span className="ml-1.5 text-xs uppercase tracking-wide text-[#6b7280]">
                    max price
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── Table ── */}
          <div
            className={`mt-6 overflow-hidden rounded-2xl border ${isDark ? "border-[#1f2937]" : "border-[#e5e7eb]"}`}
          >
            {/* Column headers */}
            <div
              className={`grid grid-cols-[1.2fr_1.5fr_1.2fr_1fr_auto] gap-3 border-b px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${
                isDark
                  ? "border-[#1f2937] bg-[#050814]/80 text-[#6b7280]"
                  : "border-[#e5e7eb] bg-[#f3f4f6] text-[#6b7280]"
              }`}
            >
              <span>Value</span>
              <span>Label</span>
              <span>Excel name</span>
              <span>Price</span>
              <span className="sr-only">Actions</span>
            </div>

            {/* Rows */}
            <div
              className={`divide-y ${isDark ? "divide-[#1f2937]" : "divide-[#f3f4f6]"}`}
            >
              {products.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-[#6b7280]">
                  No products yet. Click <strong>Add product</strong> to get
                  started.
                </div>
              ) : (
                products.map((product, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-1 gap-3 px-4 py-4 transition-colors md:grid-cols-[1.2fr_1.5fr_1.2fr_1fr_auto] md:items-center ${
                      isDark ? "hover:bg-[#1f2937]/40" : "hover:bg-[#f3f4f6]"
                    }`}
                  >
                    <div className="grid gap-1 md:contents">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7280] md:hidden">
                        Value
                      </span>
                      <input
                        value={product.value}
                        onChange={(e) =>
                          updateProduct(index, "value", e.target.value)
                        }
                        placeholder="product-key"
                        className={inputCls}
                      />
                    </div>
                    <div className="grid gap-1 md:contents">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7280] md:hidden">
                        Label
                      </span>
                      <input
                        value={product.label}
                        onChange={(e) =>
                          updateProduct(index, "label", e.target.value)
                        }
                        placeholder="Product label"
                        className={inputCls}
                      />
                    </div>
                    <div className="grid gap-1 md:contents">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7280] md:hidden">
                        Excel name
                      </span>
                      <input
                        value={product.excelName ?? ""}
                        onChange={(e) =>
                          updateProduct(index, "excelName", e.target.value)
                        }
                        placeholder="Excel name"
                        className={inputCls}
                      />
                    </div>
                    <div className="grid gap-1 md:contents">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7280] md:hidden">
                        Price
                      </span>
                      <input
                        value={String(product.price ?? 0)}
                        onChange={(e) =>
                          updateProduct(index, "price", e.target.value)
                        }
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={inputCls}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      aria-label={`Remove ${product.label || "product"}`}
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition hover:-translate-y-0.5 ${
                        isDark
                          ? "border-rose-900/50 bg-rose-900/15 text-rose-400 hover:bg-rose-900/30"
                          : "border-rose-200 text-rose-700 hover:bg-rose-50"
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
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M6 6l1 14h10l1-14" />
                      </svg>
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Footer save ── */}
          {products.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={saveProducts}
                disabled={saving}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-[#f9fafb] shadow-[0_8px_20px_rgba(5,8,20,0.4)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDark
                    ? "bg-[#1f2937] hover:bg-[#374151]"
                    : "bg-[#1f2937] hover:bg-[#374151]"
                }`}
              >
                {saving ? <SpinIcon /> : <SaveIcon />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
