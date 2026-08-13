/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,name]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `semester` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearLevel` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "semester" INTEGER NOT NULL,
ADD COLUMN     "yearLevel" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_tenantId_name_key" ON "Course"("tenantId", "name");
