/*
  Warnings:

  - You are about to drop the column `slung` on the `Tenant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Tenant_slung_key";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "slung",
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
