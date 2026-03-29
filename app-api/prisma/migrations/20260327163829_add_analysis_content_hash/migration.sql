-- Add column safely with temporary default
ALTER TABLE "AnalysisRun"
ADD COLUMN "contentHash" TEXT NOT NULL DEFAULT 'legacy_no_hash';

-- Optional index
CREATE INDEX "AnalysisRun_contentHash_idx" ON "AnalysisRun"("contentHash");