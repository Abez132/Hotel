import * as XLSX from "xlsx";
import fs from "fs";
import prisma, { withRetry } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

if (typeof XLSX.set_fs === "function") {
  XLSX.set_fs(fs);
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const allEntries = await withRetry(() =>
      prisma.entry.findMany({
        where: { userId: session.user.id },
        orderBy: [{ date: "asc" }, { fs: "asc" }, { id: "asc" }],
      }),
    );

    // Columns: fs | date | goods | amount | price | sums | daily_total
    // daily_total is blank for every regular row and filled only on the
    // totals row that appears after the last entry of each date.
    const rows = [];
    let i = 0;

    while (i < allEntries.length) {
      const currentDate = allEntries[i].date;
      const group = [];

      while (i < allEntries.length && allEntries[i].date === currentDate) {
        const e = allEntries[i];
        group.push({
          fs: e.fs,
          date: e.date,
          goods: e.goods,
          amount: e.amount,
          price: parseFloat(e.price),
          sums: parseFloat(e.sums),
          daily_total: "", // blank for regular rows
        });
        i++;
      }

      rows.push(...group);

      // Totals row — daily_total column holds the sum
      const totalSums = parseFloat(
        group.reduce((a, r) => a + r.sums, 0).toFixed(2),
      );
      const totalAmount = group.reduce((a, r) => a + r.amount, 0);
      rows.push({
        fs: "TOTAL",
        date: currentDate,
        goods: "",
        amount: totalAmount,
        price: "",
        sums: "",
        daily_total: totalSums,
      });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: ["fs", "date", "goods", "amount", "price", "sums", "daily_total"],
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
