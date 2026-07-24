-- CreateTable
CREATE TABLE "products" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "excel_name" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    CONSTRAINT "products_pkey" PRIMARY KEY ("value")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" SERIAL NOT NULL,
    "fs" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "goods" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    "sums" DECIMAL(10, 2) NOT NULL,
    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);