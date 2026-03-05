/*
  Warnings:

  - You are about to drop the `Additions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Removals` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `InventoryRecords` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `code` to the `InventoryRecords` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Additions_code_key";

-- DropIndex
DROP INDEX "Additions_id_key";

-- DropIndex
DROP INDEX "Removals_code_key";

-- DropIndex
DROP INDEX "Removals_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Additions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Removals";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "removals" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "size" TEXT,
    "gender" TEXT
);
INSERT INTO "new_Inventory" ("category", "code", "gender", "id", "lastUpdated", "quantity", "size") SELECT "category", "code", "gender", "id", "lastUpdated", "quantity", "size" FROM "Inventory";
DROP TABLE "Inventory";
ALTER TABLE "new_Inventory" RENAME TO "Inventory";
CREATE UNIQUE INDEX "Inventory_id_key" ON "Inventory"("id");
CREATE UNIQUE INDEX "Inventory_code_key" ON "Inventory"("code");
CREATE TABLE "new_InventoryRecords" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "code" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "removals" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "size" TEXT,
    "gender" TEXT
);
INSERT INTO "new_InventoryRecords" ("category", "date", "id", "quantity") SELECT "category", "date", "id", "quantity" FROM "InventoryRecords";
DROP TABLE "InventoryRecords";
ALTER TABLE "new_InventoryRecords" RENAME TO "InventoryRecords";
CREATE UNIQUE INDEX "InventoryRecords_id_key" ON "InventoryRecords"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
