-- AlterTable
ALTER TABLE "AnalysisRun" ALTER COLUMN "analysisVersion" DROP DEFAULT,
ALTER COLUMN "insights" DROP DEFAULT,
ALTER COLUMN "skills" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "sourceType" TEXT NOT NULL DEFAULT 'manual';

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");
