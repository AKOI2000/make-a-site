/*
  Warnings:

  - Added the required column `updatedAt` to the `GiftAsset` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GiftAssetStatus" AS ENUM ('PENDING', 'READY');

-- AlterTable
ALTER TABLE "GiftAsset" ADD COLUMN     "status" "GiftAssetStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
