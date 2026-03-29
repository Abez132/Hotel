import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Required in ESM/server-bundled environments so xlsx can write to disk.
if (typeof XLSX.set_fs === "function") {
  XLSX.set_fs(fs);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const row = {
      name: String(body?.name ?? "").trim(),
      age: String(body?.age ?? "").trim(),
      email: String(body?.email ?? "").trim(),
      ts: String("").trim(),
      tl: String("").trim(),
    };

    if (!row.name || !row.age || !row.email) {
      return Response.json({ message: "Missing required fields" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "data.xlsx");

    let workbook;
    let worksheet;

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets[workbook.SheetNames[0]];
    } else {
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.json_to_sheet([]);
    }

    const existingData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    const normalizedData = existingData.map((item) => ({
      name: String(item?.name ?? "").trim(),
      age: String(item?.age ?? "").trim(),
      email: String(item?.email ?? "").trim(),
      ts: String("").trim(),
      tl: String("").trim(),
    }));
    normalizedData.push(row);

    const newSheet = XLSX.utils.json_to_sheet(normalizedData, {
      header: ["name", "age", "mak"],
    });
    workbook.SheetNames = [];
    workbook.Sheets = {};
    XLSX.utils.book_append_sheet(workbook, newSheet, "Sheet1");
    XLSX.writeFile(workbook, filePath);

    return Response.json({ message: "Saved!", data: row });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ message: "Failed to save data", error: message }, { status: 500 });
  }
}