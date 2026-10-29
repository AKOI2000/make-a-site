-- CreateEnum
CREATE TYPE "GiftWebsiteStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftWebsite" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "occasionType" TEXT NOT NULL DEFAULT 'BIRTHDAY',
    "templateId" TEXT NOT NULL DEFAULT 'birthday-classic',
    "templateVersion" INTEGER NOT NULL DEFAULT 1,
    "status" "GiftWebsiteStatus" NOT NULL DEFAULT 'DRAFT',
    "content" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftWebsite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GiftWebsite_slug_key" ON "GiftWebsite"("slug");

-- CreateIndex
CREATE INDEX "GiftWebsite_ownerId_idx" ON "GiftWebsite"("ownerId");

-- CreateIndex
CREATE INDEX "GiftWebsite_ownerId_status_idx" ON "GiftWebsite"("ownerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GiftAsset_storageKey_key" ON "GiftAsset"("storageKey");

-- CreateIndex
CREATE INDEX "GiftAsset_ownerId_idx" ON "GiftAsset"("ownerId");

-- CreateIndex
CREATE INDEX "GiftAsset_websiteId_sortOrder_idx" ON "GiftAsset"("websiteId", "sortOrder");

-- AddForeignKey
ALTER TABLE "GiftWebsite" ADD CONSTRAINT "GiftWebsite_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftAsset" ADD CONSTRAINT "GiftAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftAsset" ADD CONSTRAINT "GiftAsset_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "GiftWebsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
