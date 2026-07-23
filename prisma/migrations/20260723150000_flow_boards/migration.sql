-- CreateTable
CREATE TABLE "FlowBoard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodes" JSONB NOT NULL DEFAULT '[]',
    "edges" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlowBoard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlowBoard_userId_idx" ON "FlowBoard"("userId");

-- CreateIndex
CREATE INDEX "FlowBoard_subjectId_idx" ON "FlowBoard"("subjectId");

-- CreateIndex
CREATE INDEX "FlowBoard_userId_subjectId_idx" ON "FlowBoard"("userId", "subjectId");

-- AddForeignKey
ALTER TABLE "FlowBoard" ADD CONSTRAINT "FlowBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowBoard" ADD CONSTRAINT "FlowBoard_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
