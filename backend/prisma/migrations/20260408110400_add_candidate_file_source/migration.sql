-- CreateEnum
CREATE TYPE "CandidateFileSource" AS ENUM ('ONBOARDING', 'CANDIDATE_PRIVATE', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "CandidateFile" ADD COLUMN     "source" "CandidateFileSource" NOT NULL DEFAULT 'EMPLOYEE';
