-- CreateTable
CREATE TABLE "category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "catName" TEXT NOT NULL,
    "sizeType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "gender" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gender_name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "category_gender" (
    "catid" INTEGER NOT NULL,
    "genderid" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("catid", "genderid"),
    CONSTRAINT "category_gender_catid_fkey" FOREIGN KEY ("catid") REFERENCES "category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "category_gender_genderid_fkey" FOREIGN KEY ("genderid") REFERENCES "gender" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "category_catName_key" ON "category"("catName");

-- CreateIndex
CREATE UNIQUE INDEX "gender_gender_name_key" ON "gender"("gender_name");
