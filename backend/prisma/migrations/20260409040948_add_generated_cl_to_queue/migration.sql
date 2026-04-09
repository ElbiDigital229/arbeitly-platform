-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "clUsed" TEXT;

-- AlterTable
ALTER TABLE "CandidateJobQueue" ADD COLUMN     "generatedClId" TEXT;

-- AddForeignKey
ALTER TABLE "CandidateJobQueue" ADD CONSTRAINT "CandidateJobQueue_generatedClId_fkey" FOREIGN KEY ("generatedClId") REFERENCES "CoverLetter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
