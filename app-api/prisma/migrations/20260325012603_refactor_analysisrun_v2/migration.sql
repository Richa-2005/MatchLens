/*
  Safe V2 refactor for AnalysisRun:
  - add new columns with defaults so existing rows survive
  - backfill new JSON fields from old V1 columns
  - then remove old columns
*/

ALTER TABLE "AnalysisRun"
ADD COLUMN "analysisVersion" TEXT NOT NULL DEFAULT 'v1',
ADD COLUMN "insights" JSONB NOT NULL DEFAULT '{"strengths":[],"issues":[],"tips":[]}'::jsonb,
ADD COLUMN "skills" JSONB NOT NULL DEFAULT '{"matched":[],"related":[],"missing":[],"highImpactMissing":[]}'::jsonb;

UPDATE "AnalysisRun"
SET "skills" = jsonb_build_object(
  'matched', COALESCE(to_jsonb("matchedSkills"), '[]'::jsonb),
  'related', '[]'::jsonb,
  'missing', COALESCE(to_jsonb("missingSkills"), '[]'::jsonb),
  'highImpactMissing', COALESCE(to_jsonb("highImpactMissing"), '[]'::jsonb)
);

UPDATE "AnalysisRun"
SET "analysisVersion" = 'v1'
WHERE "analysisVersion" IS NULL OR "analysisVersion" = '';

ALTER TABLE "AnalysisRun"
DROP COLUMN "highImpactMissing",
DROP COLUMN "matchedSkills",
DROP COLUMN "missingSkills";