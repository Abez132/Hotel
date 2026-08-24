import prisma, { withRetry } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function resolveProduct(goodsInput, userId) {
  const normalized = normalizeText(goodsInput);

  let product = await withRetry(() =>
    prisma.product.findFirst({
      where: {
        value: normalized,
        userId: userId,
      },
    }),
  );

  if (!product) {
    const all = await withRetry(() =>
      prisma.product.findMany({ where: { userId: userId } }),
    );
    product = all.find((p) => normalizeText(p.label) === normalized) ?? null;
  }

  return product;
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

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

    const product = await resolveProduct(body.goods, session.user.id);
    if (!product) {
      return Response.json({ message: "Invalid goods value" }, { status: 400 });
    }

    const price = parseFloat(product.price);
    const sums = parseFloat((price * amount).toFixed(2));
    const goods = product.excelName ?? product.label;

    await withRetry(() =>
      prisma.entry.create({
        data: {
          fs: fsValue,
          date,
          goods,
          amount,
          price,
          sums,
          userId: session.user.id,
        },
      }),
    );

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
