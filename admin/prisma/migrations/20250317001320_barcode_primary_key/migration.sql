/*
  Warnings:

  - The primary key for the `Inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Inventory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Gender` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ItemCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ItemStyle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sizeCode]` on the table `Size` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inventory" (
    "barcode" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" INTEGER,
    "styleId" INTEGER,
    "sizeId" INTEGER,
    "genderId" INTEGER,
    CONSTRAINT "Inventory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Inventory_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "ItemStyle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Inventory_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Inventory_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "Gender" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Inventory" ("barcode", "categoryId", "genderId", "lastUpdated", "quantity", "sizeId", "styleId") SELECT "barcode", "categoryId", "genderId", "lastUpdated", "quantity", "sizeId", "styleId" FROM "Inventory";
DROP TABLE "Inventory";
ALTER TABLE "new_Inventory" RENAME TO "Inventory";
CREATE UNIQUE INDEX "Inventory_barcode_key" ON "Inventory"("barcode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Gender_name_key" ON "Gender"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_name_key" ON "ItemCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ItemStyle_name_key" ON "ItemStyle"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Size_sizeCode_key" ON "Size"("sizeCode");
