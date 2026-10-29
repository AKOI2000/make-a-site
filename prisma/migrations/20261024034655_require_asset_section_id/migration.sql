/*
  Warnings:

  - Made the column `sectionId` on table `GiftAsset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GiftAsset" ALTER COLUMN "sectionId" SET NOT NULL;
