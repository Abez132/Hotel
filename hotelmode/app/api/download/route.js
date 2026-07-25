import * as XLSX from "xlsx";
import fs from "fs";
import prisma, { withRetry } from "@/lib/db";

export const runtime = "nodejs";

if (typeof XLSX.set_fs === "function") {
  XLSX.set_fs(fs);
}

export async function GET() {
  try {
    const allEntries = await withRetry(() =>
      prisma.entry.findMany({
        orderBy: [{ fs: "asc" }, { id: "asc" }],
      }),
    );

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

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const filename = `entries-${yyyy}-${mm}-${dd}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { message: "Failed to generate Excel file", error: message },
      { status: 500 },
    );
  }
}
