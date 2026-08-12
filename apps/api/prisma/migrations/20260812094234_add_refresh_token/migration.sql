-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "domain" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshTokenHash" TEXT;
