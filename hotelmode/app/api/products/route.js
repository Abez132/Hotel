import prisma, { withRetry } from "@/lib/db";

export const runtime = "nodejs";

function normalizeValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProduct(product) {
  return {
    value: normalizeValue(product?.value),
    label: String(product?.label ?? "").trim(),
    excelName: String(product?.excelName ?? "").trim() || null,
    price: parseFloat(parseFloat(product?.price ?? 0).toFixed(2)),
  };
}

function isValidProduct(p) {
  return Boolean(p.value && p.label && Number.isFinite(p.price));
}

function toClientProduct(p) {
  return {
    value: p.value,
    label: p.label,
    ...(p.excelName ? { excelName: p.excelName } : {}),
    price: parseFloat(p.price),
  };
}

export async function GET() {
  try {
    const products = await withRetry(() =>
      prisma.product.findMany({ orderBy: { label: "asc" } }),
    );
    return Response.json({ products: products.map(toClientProduct) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { message: "Failed to read products", error: message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const incoming = Array.isArray(body?.products)
      ? body.products
      : body?.product
        ? [body.product]
        : [];

    if (!incoming.length) {
      return Response.json(
        { message: "No products received" },
        { status: 400 },
      );
    }

    const normalized = incoming.map(normalizeProduct).filter(isValidProduct);
    if (!normalized.length) {
      return Response.json(
        { message: "Invalid product data" },
        { status: 400 },
      );
    }

    await withRetry(() =>
      prisma.$transaction([
        ...normalized.map((p) =>
          prisma.product.upsert({
            where: { value: p.value },
            update: { label: p.label, excelName: p.excelName, price: p.price },
            create: {
              value: p.value,
              label: p.label,
              excelName: p.excelName,
              price: p.price,
            },
          }),
        ),
        prisma.product.deleteMany({
          where: { value: { notIn: normalized.map((p) => p.value) } },
        }),
      ]),
    );

    const products = await withRetry(() =>
      prisma.product.findMany({ orderBy: { label: "asc" } }),
    );
    return Response.json({
      message: "Products saved",
      products: products.map(toClientProduct),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { message: "Failed to save products", error: message },
      { status: 500 },
    );
  }
}
