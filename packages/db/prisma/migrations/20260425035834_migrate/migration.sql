/*
  Warnings:

  - The primary key for the `HostMachine` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[name]` on the table `HostMachine` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_machineId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_machineId_fkey";

-- AlterTable
ALTER TABLE "HostMachine" DROP CONSTRAINT "HostMachine_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "HostMachine_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "HostMachine_id_seq";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "machineId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "machineId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "HostMachine_name_key" ON "HostMachine"("name");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "HostMachine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "HostMachine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
