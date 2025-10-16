-- CreateTable
CREATE TABLE "InventoryRecords" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL
);