-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "acceptedCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "acceptsRemote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "baseCity" TEXT,
ADD COLUMN     "baseCountry" TEXT,
ADD COLUMN     "candidateLanguages" JSONB,
ADD COLUMN     "careerGoal" TEXT,
ADD COLUMN     "currentRoleId" TEXT,
ADD COLUMN     "salaryCurrency" TEXT DEFAULT 'EUR',
ADD COLUMN     "salaryMax" INTEGER,
ADD COLUMN     "salaryMin" INTEGER,
ADD COLUMN     "skillIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetIndustryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workAuth" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "yearsExperienceMax" INTEGER,
ADD COLUMN     "yearsExperienceMin" INTEGER;

-- CreateTable
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "families" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_key_key" ON "JobRole"("key");

-- CreateIndex
CREATE INDEX "JobRole_family_idx" ON "JobRole"("family");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_key_key" ON "Industry"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_key_key" ON "Skill"("key");
