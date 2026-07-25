import prisma, { withRetry } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/entries
export async function GET() {
  try {
    const entries = await withRetry(() =>
      prisma.entry.findMany({ orderBy: [{ fs: "asc" }, { id: "asc" }] }),
    );
    return Response.json({
      entries: entries.map((e) => ({
        id: e.id,
        fs: e.fs,
        date: e.date,
        goods: e.goods,
        amount: e.amount,
        price: parseFloat(e.price),
        sums: parseFloat(e.sums),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { message: "Failed to fetch entries", error: message },
      { status: 500 },
    );
  }
}

// PATCH /api/entries — update a single entry { id, fs?, date?, goods?, amount?, price? }
export async function PATCH(req) {
  try {
    const body = await req.json();
    const id = parseInt(String(body?.id ?? ""), 10);
    if (!id || isNaN(id)) {
      return Response.json({ message: "Invalid entry id" }, { status: 400 });
    }

    const existing = await withRetry(() =>
      prisma.entry.findUnique({ where: { id } }),
    );
    if (!existing) {
      return Response.json({ message: "Entry not found" }, { status: 404 });
    }

    const fs = body.fs !== undefined ? String(body.fs).trim() : existing.fs;
    const date =
      body.date !== undefined ? String(body.date).trim() : existing.date;
    const goods =
      body.goods !== undefined ? String(body.goods).trim() : existing.goods;
    const amount =
      body.amount !== undefined
        ? parseInt(String(body.amount), 10)
        : existing.amount;
    const price =
      body.price !== undefined
        ? parseFloat(String(body.price))
        : parseFloat(existing.price);
    const sums = parseFloat((price * amount).toFixed(2));

    const updated = await withRetry(() =>
      prisma.entry.update({
        where: { id },
        data: { fs, date, goods, amount, price, sums },
      }),
    );

    return Response.json({
      entry: {
        id: updated.id,
        fs: updated.fs,
        date: updated.date,
        goods: updated.goods,
        amount: updated.amount,
        price: parseFloat(updated.price),
        sums: parseFloat(updated.sums),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { message: "Failed to update entry", error: message },
      { status: 500 },
    );
  }
}

// DELETE /api/entries — delete a single entry { id }
export async function DELETE(req) {
  try {
    const body = await req.json();
    const id = parseInt(String(body?.id ?? ""), 10);
    if (!id || isNaN(id)) {
      return Response.json({ message: "Invalid entry id" }, { status: 400 });
    }

    const existing = await withRetry(() =>
      prisma.entry.findUnique({ where: { id } }),
    );
    if (!existing) {
      return Response.json({ message: "Entry not found" }, { status: 404 });
    }

    await withRetry(() => prisma.entry.delete({ where: { id } }));
    return Response.json({ message: "Entry deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { message: "Failed to delete entry", error: message },
      { status: 500 },
    );
  }
}
