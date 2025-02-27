/*
  Warnings:

  - You are about to drop the column `categoryId` on the `ItemStyle` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Size` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ItemStyle" DROP CONSTRAINT "ItemStyle_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Size" DROP CONSTRAINT "Size_categoryId_fkey";

-- AlterTable
ALTER TABLE "ItemStyle" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "Size" DROP COLUMN "categoryId";
