-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#7F77DD',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Card" ADD COLUMN "deckId" TEXT;

-- CreateIndex
CREATE INDEX "Deck_subjectId_idx" ON "Deck"("subjectId");
CREATE INDEX "Deck_topicId_idx" ON "Deck"("topicId");
CREATE INDEX "Deck_subjectId_topicId_idx" ON "Deck"("subjectId", "topicId");
CREATE INDEX "Card_deckId_idx" ON "Card"("deckId");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Card" ADD CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
