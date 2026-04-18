import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const productsFilePath = path.join(process.cwd(), "data", "products.json");

function ensureProductsFile() {
  const directory = path.dirname(productsFilePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(productsFilePath)) {
    fs.writeFileSync(productsFilePath, "[]", "utf8");
  }
}

function readProducts() {
  ensureProductsFile();
  const raw = fs.readFileSync(productsFilePath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function normalizeProduct(product) {
  const value = String(product?.value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    value,
    label: String(product?.label ?? "").trim(),
    excelName: String(product?.excelName ?? "").trim() || undefined,
    price: Number(product?.price ?? 0),
  };
}

function isValidProduct(product) {
  return Boolean(product.value && product.label && Number.isFinite(product.price));
}

export async function GET() {
  try {
    const products = readProducts();
    return Response.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ message: "Failed to read products", error: message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const incomingProducts = Array.isArray(body?.products) ? body.products : body?.product ? [body.product] : [];

    if (!incomingProducts.length) {
      return Response.json({ message: "No products received" }, { status: 400 });
    }

    const normalizedIncoming = incomingProducts.map(normalizeProduct).filter(isValidProduct);
    if (!normalizedIncoming.length) {
      return Response.json({ message: "Invalid product data" }, { status: 400 });
    }

    const existingProducts = readProducts();
    const byValue = new Map(existingProducts.map((product) => [String(product.value).toLowerCase(), product]));

    for (const product of normalizedIncoming) {
      byValue.set(product.value, {
        ...product,
        ...(product.excelName ? { excelName: product.excelName } : {}),
      });
    }

    const savedProducts = Array.from(byValue.values()).sort((left, right) => left.label.localeCompare(right.label));
    ensureProductsFile();
    fs.writeFileSync(productsFilePath, JSON.stringify(savedProducts, null, 2), "utf8");

    return Response.json({ message: "Products saved", products: savedProducts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ message: "Failed to save products", error: message }, { status: 500 });
  }
}