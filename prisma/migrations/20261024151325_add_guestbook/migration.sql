-- CreateEnum
CREATE TYPE "GiftGuestbookStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "GiftGuestbook" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "status" "GiftGuestbookStatus" NOT NULL DEFAULT 'CLOSED',
    "wishCount" INTEGER NOT NULL DEFAULT 0,
    "roundNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftGuestbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftWish" (
    "id" TEXT NOT NULL,
    "guestbookId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "photoKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftWish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiftGuestbook_websiteId_key" ON "GiftGuestbook"("websiteId");

-- CreateIndex
CREATE INDEX "GiftGuestbook_websiteId_status_idx" ON "GiftGuestbook"("websiteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GiftWish_photoKey_key" ON "GiftWish"("photoKey");

-- CreateIndex
CREATE INDEX "GiftWish_guestbookId_createdAt_idx" ON "GiftWish"("guestbookId", "createdAt");

-- AddForeignKey
ALTER TABLE "GiftGuestbook" ADD CONSTRAINT "GiftGuestbook_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "GiftWebsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftWish" ADD CONSTRAINT "GiftWish_guestbookId_fkey" FOREIGN KEY ("guestbookId") REFERENCES "GiftGuestbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
