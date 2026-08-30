-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSemester" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicSemester_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademicYear_tenantId_idx" ON "AcademicYear"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_tenantId_name_key" ON "AcademicYear"("tenantId", "name");

-- CreateIndex
CREATE INDEX "AcademicSemester_tenantId_idx" ON "AcademicSemester"("tenantId");

-- CreateIndex
CREATE INDEX "AcademicSemester_academicYearId_idx" ON "AcademicSemester"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSemester_tenantId_academicYearId_number_key" ON "AcademicSemester"("tenantId", "academicYearId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSemester_tenantId_academicYearId_name_key" ON "AcademicSemester"("tenantId", "academicYearId", "name");

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicSemester" ADD CONSTRAINT "AcademicSemester_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicSemester" ADD CONSTRAINT "AcademicSemester_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
