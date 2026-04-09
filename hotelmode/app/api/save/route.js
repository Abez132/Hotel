import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Required in ESM/server-bundled environments so xlsx can write to disk.
if (typeof XLSX.set_fs === "function") {
  XLSX.set_fs(fs);
}

const products = [
{ value: "Beer", label: "Beer", price: 86.95 },
{ value: "room-standard", label: "Room Standard", excelName: "Room", price: 695.65 },
{ value: "room-deluxe", label: "Room Deluxe", excelName: "Room", price: 347.82 },
{ value: "Double bed", label: "Double bed", excelName: "Double bed", price: 1043.47 },
{ value: "AWASH WINE BIG", label: "Awash wine", price: 434.78 },
{ value: "Guder wine small", label: "Guder", price: 173.91 },
{ value: "Tegabino", label: "Tegabino", price: 147.82  },
{ value: "Areqe double", label: "Areqe double", price: 69.56 },
{ value: "Draft Single", label: "Draft Single", price: 47.82 },
{ value: "Tibs", label: "Tibs", price: 20 },
{ value: "Dabo", label: "Dabo", price: 13.04 },
{ value: "yesom ferfer", label: "yesom ferfer", price: 130.43 },
{ value: "water one liter", label: "water one liter", price: 39.13 },
{ value: "water half", label: "water half", price: 30.43 },
{ value: "Soft drink", label: "Soft drink", price: 52.17 },
{ value: "Sofi", label: "Soft drink", price: 82.60 },
{ value: "Bedele Spe", label: "Bedele Spe", price: 95.65 },
{ value: "Habesha areke", label: "Habesha areke", price: 30.43 },
{ value: "dulet", label: "dulet", price: 20 },
{ value: "negus", label: "negus", price: 82.60 },
{ value: "heinken", label: "heinken", price: 95.65 },
{ value: "Arada", label: "Arada", price: 95.65 },
{ value: "Ambo wuha", label: "Ambo wuha", price: 52.17 },
{ value: "beyaynet", label: "beyaynet", price: 130.43 },
{ value: "Tea", label: "Tea", price: 21.73 },
{ value: "Draft jambo", label: "Draft jambo", price: 95.65 },
{ value: "yejebena buna", label: "yejebena buna", price: 26.08 },
{ value: "Water Two Liter", label: "water two liter", price: 52.17 },
{ value: "Gomen", label: "Gomen", price: 130.43 },
{ value: "afagn", label: "afagn", price: 20 },
{ value: "Shero feses", label: "Shero feses", price: 130.43 },
{ value: "Tomato salad", label: "Tomato Salad", price: 130.43 },
{ value: "Pasta besigo", label: "pasta besigo", price: 130.43 }
];

function creatingRow(body){

  var pricing;
  var sum;
  const goodsValue = String(body?.goods ?? "").trim().toLowerCase();
  const selected = products.find((p) => p.value.toLowerCase() === goodsValue);
  if(selected){
    pricing=selected.price;

    sum=pricing*Number(body?.amount ?? 0);
  }else{
    return null;
  }

    console.log(sum);
    console.log(pricing);
  return {
      fs: String(body?.fs ?? "").trim(),
        goods: selected.excelName ?? String(body?.goods ?? "").trim(),
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