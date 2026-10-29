/*
  Warnings:

  - Added the required column `roundNumber` to the `GiftWish` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "GiftWish_guestbookId_createdAt_idx";

-- AlterTable
ALTER TABLE "GiftWish" ADD COLUMN     "roundNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "GiftWish_guestbookId_roundNumber_createdAt_idx" ON "GiftWish"("guestbookId", "roundNumber", "createdAt");
