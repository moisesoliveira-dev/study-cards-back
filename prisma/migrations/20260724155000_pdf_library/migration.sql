CREATE TABLE "PdfGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#7C5CFC',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PdfGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PdfDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT,
    "title" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "sizeBytes" INTEGER NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PdfDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PdfDocument_storageName_key" ON "PdfDocument"("storageName");
CREATE INDEX "PdfGroup_userId_idx" ON "PdfGroup"("userId");
CREATE INDEX "PdfGroup_userId_position_idx" ON "PdfGroup"("userId", "position");
CREATE INDEX "PdfDocument_userId_idx" ON "PdfDocument"("userId");
CREATE INDEX "PdfDocument_groupId_idx" ON "PdfDocument"("groupId");
CREATE INDEX "PdfDocument_userId_groupId_idx" ON "PdfDocument"("userId", "groupId");
CREATE INDEX "PdfDocument_userId_favorite_idx" ON "PdfDocument"("userId", "favorite");

ALTER TABLE "PdfGroup"
ADD CONSTRAINT "PdfGroup_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PdfDocument"
ADD CONSTRAINT "PdfDocument_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PdfDocument"
ADD CONSTRAINT "PdfDocument_groupId_fkey"
FOREIGN KEY ("groupId") REFERENCES "PdfGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
