-- AlterTable
ALTER TABLE "Card" ADD COLUMN "subjectId" TEXT;

-- Backfill subjectId from topic
UPDATE "Card" AS c
SET "subjectId" = t."subjectId"
FROM "Topic" AS t
WHERE c."topicId" = t."id";

-- Failsafe: drop orphan cards without subject
DELETE FROM "Card" WHERE "subjectId" IS NULL;

-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "subjectId" SET NOT NULL;
ALTER TABLE "Card" ALTER COLUMN "topicId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Card_subjectId_idx" ON "Card"("subjectId");
CREATE INDEX "Card_subjectId_topicId_idx" ON "Card"("subjectId", "topicId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
