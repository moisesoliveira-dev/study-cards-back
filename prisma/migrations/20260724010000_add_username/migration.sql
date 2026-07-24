-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Backfill from email local-part; append short id suffix on collisions
UPDATE "User"
SET "username" = lower(regexp_replace(split_part("email", '@', 1), '[^a-z0-9_]', '', 'g'));

UPDATE "User"
SET "username" = CASE
  WHEN length("username") < 3 THEN 'user' || left("id", 6)
  ELSE left("username", 24)
END
WHERE "username" IS NULL OR length("username") < 3;

WITH ranked AS (
  SELECT
    "id",
    "username",
    ROW_NUMBER() OVER (PARTITION BY "username" ORDER BY "createdAt", "id") AS rn
  FROM "User"
)
UPDATE "User" u
SET "username" = left(r."username", 18) || '_' || left(r."id", 4)
FROM ranked r
WHERE u."id" = r."id" AND r.rn > 1;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");
