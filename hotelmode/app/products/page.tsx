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
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

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
              [field]: field === "price" ? Number(value) : value,
            }
          : product,
      ),
    );
  };

  const addProduct = () => {
    setProducts((current) => [...current, createEmptyProduct()]);
  };

  const removeProduct = (index: number) => {
    setProducts((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
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
      setMessage({ type: "success", text: "Products saved." });
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

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <Link
                href="/"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#0f1231] px-4 text-sm font-semibold text-white transition hover:bg-[#302724] "
              >
                back
              </Link>
      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-white/40 bg-white/85 p-6 shadow-[0_20px_60px_rgba(10,36,64,0.18)] backdrop-blur md:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#205c78]">
              Product manager
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#0f2f45]">
              Adjust prices and add products
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#2f5269]">
              Update the catalog used by the receipt form. Changes are stored in
              the project data file and reflected in the billing page.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={addProduct}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0f2f45] px-4 text-sm font-semibold text-white transition hover:bg-[#174b69]"
            >
              Add product
            </button>
            <button
              type="button"
              onClick={saveProducts}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#ff7f50] px-4 text-sm font-semibold text-white transition hover:bg-[#e96e3d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {message ? (
          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#bfd4df] bg-white">
          <div className="grid grid-cols-[1.2fr_1.5fr_1.2fr_1fr_auto] gap-3 border-b border-[#dbe7ee] bg-[#f7fbfd] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#4c6d82]">
            <span>Value</span>
            <span>Label</span>
            <span>Excel name</span>
            <span>Price</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-[#edf2f6]">
            {products.map((product, index) => (
              <div
                key={`${product.value || "new"}-${index}`}
                className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1.2fr_1.5fr_1.2fr_1fr_auto] md:items-center"
              >
                <input
                  value={product.value}
                  onChange={(event) =>
                    updateProduct(index, "value", event.target.value)
                  }
                  placeholder="product-key"
                  className="h-11 rounded-xl border border-[#bfd4df] px-3 outline-none focus:border-[#0f2f45]"
                />
                <input
                  value={product.label}
                  onChange={(event) =>
                    updateProduct(index, "label", event.target.value)
                  }
                  placeholder="Product label"
                  className="h-11 rounded-xl border border-[#bfd4df] px-3 outline-none focus:border-[#0f2f45]"
                />
                <input
                  value={product.excelName ?? ""}
                  onChange={(event) =>
                    updateProduct(index, "excelName", event.target.value)
                  }
                  placeholder="Excel name"
                  className="h-11 rounded-xl border border-[#bfd4df] px-3 outline-none focus:border-[#0f2f45]"
                />
                <input
                  value={String(product.price ?? 0)}
                  onChange={(event) =>
                    updateProduct(index, "price", event.target.value)
                  }
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-11 rounded-xl border border-[#bfd4df] px-3 outline-none focus:border-[#0f2f45]"
                />
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-rose-200 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
