-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT NOT NULL,
    "name" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "longitude" REAL,
    "latitude" REAL,
    "resourceId" INTEGER NOT NULL,
    CONSTRAINT "location_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_location" ("addressLine1", "addressLine2", "city", "country", "id", "latitude", "longitude", "name", "postalCode", "resourceId", "state") SELECT "addressLine1", "addressLine2", "city", "country", "id", "latitude", "longitude", "name", "postalCode", "resourceId", "state" FROM "location";
DROP TABLE "location";
ALTER TABLE "new_location" RENAME TO "location";
CREATE UNIQUE INDEX "location_addressLine1_key" ON "location"("addressLine1");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
