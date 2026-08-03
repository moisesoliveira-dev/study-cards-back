-- CreateTable
CREATE TABLE "CardTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "colorId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardTag_name_key" ON "CardTag"("name");

-- CreateIndex
CREATE INDEX "CardTag_position_idx" ON "CardTag"("position");

-- CreateIndex
CREATE INDEX "CardTag_colorId_idx" ON "CardTag"("colorId");

-- AddForeignKey
ALTER TABLE "CardTag" ADD CONSTRAINT "CardTag_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default tag "Conceito" bound to the teal catalog color (or first color)
INSERT INTO "CardTag" ("id", "name", "description", "colorId", "position", "createdAt", "updatedAt")
SELECT
  'tag_conceito',
  'Conceito',
  'Tag padrão das cartas',
  c."id",
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Color" c
WHERE c."hex" = '#1D9E75'
LIMIT 1;

INSERT INTO "CardTag" ("id", "name", "description", "colorId", "position", "createdAt", "updatedAt")
SELECT
  'tag_conceito',
  'Conceito',
  'Tag padrão das cartas',
  c."id",
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Color" c
WHERE NOT EXISTS (SELECT 1 FROM "CardTag" WHERE "id" = 'tag_conceito')
ORDER BY c."position" ASC, c."name" ASC
LIMIT 1;
