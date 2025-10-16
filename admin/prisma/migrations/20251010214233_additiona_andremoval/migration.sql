-- CreateTable
CREATE TABLE "Additions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "dateAdded" DATETIME NOT NULL,
    "quantity" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Removals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "dateRemoved" DATETIME NOT NULL,
    "quantity" INTEGER NOT NULL
);