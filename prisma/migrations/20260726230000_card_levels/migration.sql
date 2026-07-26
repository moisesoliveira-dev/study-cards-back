-- CreateTable
CREATE TABLE "CardLevel" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardLevel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CardLevel_slug_key" ON "CardLevel"("slug");
CREATE INDEX "CardLevel_position_idx" ON "CardLevel"("position");

-- Seed níveis iniciais
INSERT INTO "CardLevel" ("id", "slug", "name", "description", "color", "position", "createdAt", "updatedAt")
VALUES
  ('lvl_basic', 'basic', 'Básico', 'Fundamentos e conceitos introdutórios', '#1D9E75', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('lvl_intermediate', 'intermediate', 'Intermediário', 'Aplicação e aprofundamento', '#378ADD', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('lvl_advanced', 'advanced', 'Avançado', 'Casos complexos e detalhes avançados', '#BA7517', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('lvl_extra', 'extra', 'Extra', 'Complementos, curiosidades e extras', '#7F77DD', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable Card: levelId + drop hint
ALTER TABLE "Card" ADD COLUMN "levelId" TEXT;

UPDATE "Card"
SET "levelId" = 'lvl_basic'
WHERE "levelId" IS NULL;

CREATE INDEX "Card_levelId_idx" ON "Card"("levelId");

ALTER TABLE "Card"
ADD CONSTRAINT "Card_levelId_fkey"
FOREIGN KEY ("levelId") REFERENCES "CardLevel"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Card" DROP COLUMN IF EXISTS "hint";
