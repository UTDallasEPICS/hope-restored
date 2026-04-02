/*
  Warnings:

  - You are about to drop the `Gender` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemStyle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Size` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Additions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `barcode` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `genderId` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `sizeId` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `styleId` on the `Inventory` table. All the data in the column will be lost.
  - The primary key for the `Removals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dateRemoved` on the `Removals` table. All the data in the column will be lost.
  - Added the required column `code` to the `Additions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Inventory` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `code` to the `Removals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateAdded` to the `Removals` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Gender_name_key";

-- DropIndex
DROP INDEX "ItemCategory_name_key";

-- DropIndex
DROP INDEX "ItemStyle_name_key";

-- DropIndex
DROP INDEX "Size_sizeCode_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Gender";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemCategory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemStyle";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Size";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Additions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "size" TEXT,
    "gender" TEXT,
    "quantity" INTEGER NOT NULL,
    "dateAdded" DATETIME NOT NULL
);
INSERT INTO "new_Additions" ("category", "dateAdded", "id", "quantity") SELECT "category", "dateAdded", "id", "quantity" FROM "Additions";
DROP TABLE "Additions";
ALTER TABLE "new_Additions" RENAME TO "Additions";
CREATE UNIQUE INDEX "Additions_id_key" ON "Additions"("id");
CREATE UNIQUE INDEX "Additions_code_key" ON "Additions"("code");
CREATE TABLE "new_Inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "size" TEXT,
    "gender" TEXT
);
INSERT INTO "new_Inventory" ("lastUpdated", "quantity") SELECT "lastUpdated", "quantity" FROM "Inventory";
DROP TABLE "Inventory";
ALTER TABLE "new_Inventory" RENAME TO "Inventory";
CREATE UNIQUE INDEX "Inventory_id_key" ON "Inventory"("id");
CREATE UNIQUE INDEX "Inventory_code_key" ON "Inventory"("code");
CREATE TABLE "new_Removals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "size" TEXT,
    "gender" TEXT,
    "quantity" INTEGER NOT NULL,
    "dateAdded" DATETIME NOT NULL
);
INSERT INTO "new_Removals" ("category", "id", "quantity") SELECT "category", "id", "quantity" FROM "Removals";
DROP TABLE "Removals";
ALTER TABLE "new_Removals" RENAME TO "Removals";
CREATE UNIQUE INDEX "Removals_id_key" ON "Removals"("id");
CREATE UNIQUE INDEX "Removals_code_key" ON "Removals"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
