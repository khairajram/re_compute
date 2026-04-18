-- DropIndex
DROP INDEX "User_providerId_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
