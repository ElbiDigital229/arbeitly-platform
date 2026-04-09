-- AlterTable
ALTER TABLE "CandidateJobQueue" ADD COLUMN "applicationId" TEXT,
ADD COLUMN "appliedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateJobQueue_applicationId_key" ON "CandidateJobQueue"("applicationId");

-- AddForeignKey
ALTER TABLE "CandidateJobQueue" ADD CONSTRAINT "CandidateJobQueue_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
