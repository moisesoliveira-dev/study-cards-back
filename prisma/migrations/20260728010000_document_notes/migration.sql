-- CreateTable
CREATE TABLE "DocumentNote" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "fromPos" INTEGER NOT NULL,
    "toPos" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentNote_cardId_idx" ON "DocumentNote"("cardId");

-- CreateIndex
CREATE INDEX "DocumentNote_cardId_fromPos_toPos_idx" ON "DocumentNote"("cardId", "fromPos", "toPos");

-- AddForeignKey
ALTER TABLE "DocumentNote" ADD CONSTRAINT "DocumentNote_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
