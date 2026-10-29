/*
  Warnings:

  - A unique constraint covering the columns `[guestbookId,roundNumber,visitorId]` on the table `GiftWish` will be added. If there are existing duplicate values, this will fail.
  - Made the column `visitorId` on table `GiftWish` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GiftWish" ALTER COLUMN "visitorId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GiftWish_guestbookId_roundNumber_visitorId_key" ON "GiftWish"("guestbookId", "roundNumber", "visitorId");
