-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Color_hex_key" ON "Color"("hex");

-- CreateIndex
CREATE INDEX "Color_position_idx" ON "Color"("position");

-- Seed default catalog
INSERT INTO "Color" ("id", "name", "hex", "description", "position", "createdAt", "updatedAt") VALUES
  ('seed_color_teal', 'Verde-água', '#1D9E75', 'Accent padrão', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_color_blue', 'Azul', '#378ADD', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_color_amber', 'Âmbar', '#BA7517', NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_color_violet', 'Violeta', '#7F77DD', NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_color_rose', 'Rosa', '#D4537E', NULL, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_color_orange', 'Laranja', '#D85A30', NULL, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_color_gray', 'Cinza', '#888780', NULL, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
