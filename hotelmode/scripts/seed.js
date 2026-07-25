"use strict";
/**
 * Seed the database with products from data/products.json.
 *
 *   node scripts/seed.js
 *
 * Requires DATABASE_URL in environment or .env.local
 */

import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

// Manually load .env.local if present (no dotenv dependency needed)
try {
  const lines = readFileSync(join(__dirname, "..", ".env.local"), "utf8").split(
    "\n",
  );
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // no .env.local — rely on environment variables
}

const prisma = new PrismaClient();

async function seed() {
  const filePath = join(__dirname, "..", "data", "products.json");
  const products = JSON.parse(readFileSync(filePath, "utf8"));

  let count = 0;
  for (const p of products) {
    const value = String(p.value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const label = String(p.label ?? "").trim();
    const excelName = p.excelName ? String(p.excelName).trim() : null;
    const price = parseFloat(parseFloat(p.price ?? 0).toFixed(2));

    if (!value || !label) continue;

    await prisma.product.upsert({
      where: { value },
      update: { label, excelName, price },
      create: { value, label, excelName, price },
    });
    count++;
  }

  console.log(`Seeded ${count} products.`);
  await prisma.$disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await prisma.$disconnect();
  process.exit(1);
});
