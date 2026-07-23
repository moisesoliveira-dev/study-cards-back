-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('NEW', 'REVIEW', 'KNOWN');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "status" "CardStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "tag" TEXT NOT NULL DEFAULT 'Conceito';

-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "color" SET DEFAULT '#BA7517';

-- CreateTable
CREATE TABLE "CardLink" (
    "id" TEXT NOT NULL,
    "sourceCardId" TEXT NOT NULL,
    "targetCardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CardLink_sourceCardId_idx" ON "CardLink"("sourceCardId");

-- CreateIndex
CREATE INDEX "CardLink_targetCardId_idx" ON "CardLink"("targetCardId");

-- CreateIndex
CREATE UNIQUE INDEX "CardLink_sourceCardId_targetCardId_key" ON "CardLink"("sourceCardId", "targetCardId");

-- CreateIndex
CREATE INDEX "Card_status_idx" ON "Card"("status");

-- AddForeignKey
ALTER TABLE "CardLink" ADD CONSTRAINT "CardLink_sourceCardId_fkey" FOREIGN KEY ("sourceCardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardLink" ADD CONSTRAINT "CardLink_targetCardId_fkey" FOREIGN KEY ("targetCardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
