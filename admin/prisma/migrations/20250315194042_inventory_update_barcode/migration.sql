/*
  Warnings:

  - The primary key for the `Inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Gender_name_key";

-- DropIndex
DROP INDEX "ItemCategory_name_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "barcode" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" INTEGER NOT NULL,
    "styleId" INTEGER NOT NULL,
    "sizeId" INTEGER NOT NULL,
    "genderId" INTEGER NOT NULL,
    CONSTRAINT "Inventory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inventory_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "ItemStyle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inventory_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inventory_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "Gender" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Inventory" ("barcode", "categoryId", "genderId", "lastUpdated", "quantity", "sizeId", "styleId") SELECT "barcode", "categoryId", "genderId", "lastUpdated", "quantity", "sizeId", "styleId" FROM "Inventory";
DROP TABLE "Inventory";
ALTER TABLE "new_Inventory" RENAME TO "Inventory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
