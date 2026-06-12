-- Keep the most recently updated application for each user/job/resume pair.
WITH ranked_applications AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY "userId", "jobDescriptionId", "resumeId"
            ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" DESC
        ) AS duplicate_rank
    FROM "Application"
)
DELETE FROM "Application"
WHERE "id" IN (
    SELECT "id"
    FROM ranked_applications
    WHERE duplicate_rank > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_jobDescriptionId_resumeId_key"
ON "Application"("userId", "jobDescriptionId", "resumeId");
