import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Required in ESM/server-bundled environments so xlsx can write to disk.
if (typeof XLSX.set_fs === "function") {
  XLSX.set_fs(fs);
}

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

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function creatingRow(body){

  var pricing;
  var sum;
  const goodsValue = normalizeText(body?.goods);
  const products = readProducts();
  const selected = products.find((product) => {
    const candidateValue = normalizeText(product?.value);
    const candidateLabel = normalizeText(product?.label);
    return candidateValue === goodsValue || candidateLabel === goodsValue;
  });
  if(selected){
    pricing=Number(selected.price);

    sum=pricing*Number(body?.amount ?? 0);
  }else{
    return null;
  }

  return {
      fs: String(body?.fs ?? "").trim(),
        goods: selected.excelName ?? selected.label ?? String(body?.goods ?? "").trim(),
      amount: String(body?.amount ?? "").trim(),
      price:pricing,
      sums:sum,
    };
};

export async function POST(req) {
  try {
    const body = await req.json();

   const row= creatingRow(body);

    if (!row) {
      return Response.json({ message: "Invalid goods value" }, { status: 400 });
    }

    if (!row.fs || !row.goods || !row.amount || row.price == null || row.sums == null) {
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
      fs: String(item?.fs ?? "").trim(),
      goods: String(item?.goods ?? "").trim(),
      amount: String(item?.amount ?? "").trim(),
      price: item?.price ?? 0,
      sums: item?.sums ?? item?.sum ?? 0,
    }));
    normalizedData.push(row);

    const newSheet = XLSX.utils.json_to_sheet(normalizedData, {
      header: ["fs", "goods", "amount" , "price" ,"sums"],
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