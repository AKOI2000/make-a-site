/*
  Warnings:

  - Added the required column `sectionId` to the `GiftAsset` table without a default value. This is not possible if the table is not empty.

*/

-- DropIndex
DROP INDEX "GiftAsset_websiteId_sortOrder_idx";

-- AlterTable
ALTER TABLE "GiftAsset" ADD COLUMN "sectionId" TEXT;

-- CreateIndex
CREATE INDEX "GiftAsset_websiteId_sectionId_sortOrder_idx"
ON "GiftAsset"("websiteId", "sectionId", "sortOrder");

