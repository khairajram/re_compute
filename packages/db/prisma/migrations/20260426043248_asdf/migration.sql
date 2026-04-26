/*
  Warnings:

  - You are about to drop the column `isActive` on the `HostMachine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HostMachine" DROP COLUMN "isActive",
ADD COLUMN     "inUse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "gpu" DROP NOT NULL,
ALTER COLUMN "storage" DROP NOT NULL;
