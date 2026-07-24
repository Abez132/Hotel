import * as XLSX from "xlsx";
import fs from "fs";
import { join } from "path";
import prisma from "@/lib/db";

export const runtime = "nodejs";

if (typeof XLSX.set_fs === "function") {
  XLSX.set_fs(fs);
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function resolveProduct(goodsInput) {
  const normalized = normalizeText(goodsInput);

  // Try exact value match first
  let product = await prisma.product.findUnique({
    where: { value: normalized },
  });

  // Fall back to scanning by normalized label
  if (!product) {
    const all = await prisma.product.findMany();
    product = all.find((p) => normalizeText(p.label) === normalized) ?? null;
  }

  return product;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const fsValue = String(body?.fs ?? "").trim();
    const date = String(body?.date ?? "").trim();
    const amount = parseInt(String(body?.amount ?? "1"), 10);

    if (!fsValue || !body?.goods || !date) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const product = await resolveProduct(body.goods);
    if (!product) {
      return Response.json({ message: "Invalid goods value" }, { status: 400 });
    }

    const price = parseFloat(product.price);
    const sums = parseFloat((price * amount).toFixed(2));
    const goods = product.excelName ?? product.label;

    // Persist entry to Postgres via Prisma
    await prisma.entry.create({
      data: { fs: fsValue, date, goods, amount, price, sums },
    });

    // Regenerate data.xlsx from all entries sorted by fs
    const allEntries = await prisma.entry.findMany({
      orderBy: [{ fs: "asc" }, { id: "asc" }],
    });

    const rows = allEntries.map((e) => ({
      fs: e.fs,
      date: e.date,
      goods: e.goods,
      amount: e.amount,
      price: parseFloat(e.price),
      sums: parseFloat(e.sums),
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: ["fs", "date", "goods", "amount", "price", "sums"],
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, join(process.cwd(), "data.xlsx"));

    return Response.json({
      message: "Saved!",
      data: { fs: fsValue, date, goods, amount, price, sums },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { message: "Failed to save data", error: message },
      { status: 500 },
    );
  }
}
