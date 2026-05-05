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

  // Sync theme with localStorage (shared with main page)
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

  // Auto-dismiss message
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
        if (!response.ok) {
          throw new Error(
            payload?.error || payload?.message || "Failed to load products",
          );
        }
        if (!ignore) {
          setProducts(Array.isArray(payload.products) ? payload.products : []);
        }
      } catch (error) {
        if (!ignore) {
          setMessage({
            type: "error",
            text:
              error instanceof Error
                ? error.message
                : "Failed to load products",
          });
        }
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
      current.map((product, currentIndex) =>
        currentIndex === index
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

  const addProduct = () => {
    setProducts((current) => [...current, createEmptyProduct()]);
  };

  const removeProduct = (index: number) => {
    setProducts((current) => current.filter((_, i) => i !== index));
  };

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
      if (!response.ok) {
        throw new Error(
          payload?.error || payload?.message || "Failed to save products",
        );
      }
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

  const inputCls = `h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:ring-4 ${
    isDark
      ? "border-[#35556a] bg-[#102736] text-[#e6f3ff] placeholder:text-[#4a7a96] focus:border-[#7ad8ff] focus:ring-[#7ad8ff]/15"
      : "border-[#bfd4df] bg-white text-[#0f2f45] placeholder:text-[#9bbcce] focus:border-[#0f2f45] focus:ring-[#0f2f45]/10"
  }`;

  return (
    <div
      className={`relative min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-linear-to-b from-[#071018] via-[#0b1d2a] to-[#132635]"
          : "bg-linear-to-b from-[#f8fcff] via-[#fffaf1] to-[#eef8ff]"
      }`}
    >
      {/* Ambient blobs */}
      <div
        className={`pointer-events-none fixed -left-20 top-0 h-72 w-72 rounded-full blur-3xl will-change-transform ${isDark ? "bg-[#1f4f6d]/40" : "bg-[#ffd447]/40"}`}
      />
      <div
        className={`pointer-events-none fixed -right-12 top-1/3 h-64 w-64 rounded-full blur-3xl will-change-transform ${isDark ? "bg-[#2f7aa8]/30" : "bg-[#ff7f50]/30"}`}
      />
      <div
        className={`pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl will-change-transform ${isDark ? "bg-[#3ca7a5]/20" : "bg-[#7ad8ff]/30"}`}
      />

      {/* Top bar */}
      <div
        className={`sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur sm:px-8 ${
          isDark
            ? "border-[#2d5268]/60 bg-[#071018]/80"
            : "border-[#dbe7ee]/80 bg-white/80"
        }`}
      >
        <Link
          href="/"
          className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
            isDark
              ? "border-[#2d5268] bg-[#0f2433] text-[#e5f3ff] hover:bg-[#163447]"
              : "border-[#bfd4df] bg-white text-[#0f2f45] hover:bg-[#f0f8ff]"
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
          className={`hidden text-xs font-semibold uppercase tracking-[0.2em] sm:block ${isDark ? "text-[#7ad8ff]" : "text-[#205c78]"}`}
        >
          Hotel mode · Product manager
        </p>

        {/* Dark / Light toggle */}
        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
            isDark
              ? "border-[#2d5268] bg-[#0f2433] text-[#e5f3ff] hover:bg-[#163447]"
              : "border-[#bfd4df] bg-white/90 text-[#0f2f45] hover:bg-white"
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

      <div className="px-4 py-8 sm:px-8 sm:py-10">
        <section
          className={`mx-auto w-full max-w-5xl rounded-3xl border p-6 shadow-[0_20px_60px_rgba(10,36,64,0.25)] backdrop-blur md:p-10 ${
            isDark
              ? "border-[#2d5268]/80 bg-[#0c1f2d]/85"
              : "border-white/40 bg-white/85"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-[#7ad8ff]" : "text-[#205c78]"}`}
              >
                Product manager
              </p>
              <h1
                className={`mt-2 text-3xl font-extrabold ${isDark ? "text-[#e6f3ff]" : "text-[#0f2f45]"}`}
              >
                Adjust prices &amp; products
              </h1>
              <p
                className={`mt-2 max-w-xl text-sm ${isDark ? "text-[#9fc7df]" : "text-[#2f5269]"}`}
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
                    ? "border-[#35556a] bg-[#102736] text-[#7ad8ff] hover:bg-[#163447]"
                    : "border-[#bfd4df] bg-white text-[#0f2f45] hover:bg-[#f0f8ff]"
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
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff7f50] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,127,80,0.35)] transition hover:-translate-y-0.5 hover:bg-[#e96e3d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
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
                ) : (
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
                )}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>

          {/* Toast message */}
          {message ? (
            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
                message.type === "success"
                  ? isDark
                    ? "border-emerald-700/50 bg-emerald-900/30 text-emerald-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : isDark
                    ? "border-rose-700/50 bg-rose-900/30 text-rose-300"
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

          {/* Stats bar */}
          <div
            className={`mt-6 flex items-center gap-6 rounded-2xl border px-5 py-3 text-sm ${
              isDark
                ? "border-[#2d5268]/60 bg-[#0f2433]/60"
                : "border-[#dbe7ee] bg-[#f7fbfd]"
            }`}
          >
            <div>
              <span
                className={`font-extrabold text-lg ${isDark ? "text-[#e6f3ff]" : "text-[#0f2f45]"}`}
              >
                {products.length}
              </span>
              <span
                className={`ml-1.5 text-xs uppercase tracking-wide ${isDark ? "text-[#7ad8ff]" : "text-[#205c78]"}`}
              >
                products
              </span>
            </div>
            {products.length > 0 && (
              <>
                <div
                  className={`h-5 w-px ${isDark ? "bg-[#2d5268]" : "bg-[#dbe7ee]"}`}
                />
                <div>
                  <span
                    className={`font-extrabold text-lg ${isDark ? "text-[#e6f3ff]" : "text-[#0f2f45]"}`}
                  >
                    {Math.min(...products.map((p) => p.price)).toFixed(2)}
                  </span>
                  <span
                    className={`ml-1.5 text-xs uppercase tracking-wide ${isDark ? "text-[#7ad8ff]" : "text-[#205c78]"}`}
                  >
                    min price
                  </span>
                </div>
                <div
                  className={`h-5 w-px ${isDark ? "bg-[#2d5268]" : "bg-[#dbe7ee]"}`}
                />
                <div>
                  <span
                    className={`font-extrabold text-lg ${isDark ? "text-[#e6f3ff]" : "text-[#0f2f45]"}`}
                  >
                    {Math.max(...products.map((p) => p.price)).toFixed(2)}
                  </span>
                  <span
                    className={`ml-1.5 text-xs uppercase tracking-wide ${isDark ? "text-[#7ad8ff]" : "text-[#205c78]"}`}
                  >
                    max price
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Table */}
          <div
            className={`mt-6 overflow-hidden rounded-2xl border ${isDark ? "border-[#2d5268]/60" : "border-[#bfd4df]"}`}
          >
            {/* Column headers */}
            <div
              className={`grid grid-cols-[1.2fr_1.5fr_1.2fr_1fr_auto] gap-3 border-b px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${
                isDark
                  ? "border-[#2d5268]/60 bg-[#0f2433]/80 text-[#7ad8ff]"
                  : "border-[#dbe7ee] bg-[#f7fbfd] text-[#4c6d82]"
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
              className={`divide-y ${isDark ? "divide-[#1a3547]" : "divide-[#edf2f6]"}`}
            >
              {products.length === 0 ? (
                <div
                  className={`px-4 py-12 text-center text-sm ${isDark ? "text-[#4a7a96]" : "text-[#9bbcce]"}`}
                >
                  No products yet. Click <strong>Add product</strong> to get
                  started.
                </div>
              ) : (
                products.map((product, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-1 gap-3 px-4 py-4 transition-colors md:grid-cols-[1.2fr_1.5fr_1.2fr_1fr_auto] md:items-center ${
                      isDark ? "hover:bg-[#0f2433]/50" : "hover:bg-[#f7fbfd]"
                    }`}
                  >
                    {/* Mobile labels */}
                    <div className="contents md:contents">
                      <div className="grid gap-1 md:contents">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide md:hidden ${isDark ? "text-[#7ad8ff]" : "text-[#205c78]"}`}
                        >
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
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide md:hidden ${isDark ? "text-[#7ad8ff]" : "text-[#205c78]"}`}
                        >
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
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide md:hidden ${isDark ? "text-[#7ad8ff]" : "text-[#205c78]"}`}
                        >
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
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide md:hidden ${isDark ? "text-[#7ad8ff]" : "text-[#205c78]"}`}
                        >
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
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      aria-label={`Remove ${product.label || "product"}`}
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition hover:-translate-y-0.5 ${
                        isDark
                          ? "border-rose-800/60 bg-rose-900/20 text-rose-400 hover:bg-rose-900/40"
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

          {/* Footer action row */}
          {products.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={saveProducts}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff7f50] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,127,80,0.35)] transition hover:-translate-y-0.5 hover:bg-[#e96e3d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
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
                ) : (
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
                )}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
