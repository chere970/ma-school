-- CreateTable
CREATE TABLE "StudentResult" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "grade" TEXT,
    "gradePoint" DECIMAL(4,2),
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentResult_tenantId_idx" ON "StudentResult"("tenantId");

-- CreateIndex
CREATE INDEX "StudentResult_assessmentId_idx" ON "StudentResult"("assessmentId");

-- CreateIndex
CREATE INDEX "StudentResult_studentId_idx" ON "StudentResult"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentResult_tenantId_assessmentId_studentId_key" ON "StudentResult"("tenantId", "assessmentId", "studentId");

-- AddForeignKey
ALTER TABLE "StudentResult" ADD CONSTRAINT "StudentResult_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentResult" ADD CONSTRAINT "StudentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentResult" ADD CONSTRAINT "StudentResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
