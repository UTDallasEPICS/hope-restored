-- DropIndex
DROP INDEX "search_idx";

-- AlterTable
ALTER TABLE "_DemographicToResource" ADD CONSTRAINT "_DemographicToResource_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DemographicToResource_AB_unique";

-- AlterTable
ALTER TABLE "_LanguageToResource" ADD CONSTRAINT "_LanguageToResource_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_LanguageToResource_AB_unique";
