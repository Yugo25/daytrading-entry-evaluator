CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Week" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "theme" TEXT,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setup" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "pair" TEXT NOT NULL,
    "direction" TEXT,
    "execTf" TEXT NOT NULL,
    "notes" TEXT,
    "numericData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetupImage" (
    "id" TEXT NOT NULL,
    "setupId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SetupImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "setupId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "strategyVersion" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "structured" TEXT NOT NULL,
    "rendered" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "overallLabel" TEXT NOT NULL,
    "fewShotIds" TEXT NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "agree" BOOLEAN NOT NULL,
    "correctedScore" INTEGER,
    "correctedElements" TEXT,
    "comment" TEXT NOT NULL,
    "useAsExample" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "weekId" TEXT,
    "setupId" TEXT,
    "journalNo" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "holdTime" TEXT,
    "pair" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "execTf" TEXT NOT NULL,
    "lineGrade" TEXT,
    "aoiGrade" TEXT,
    "outcome" TEXT NOT NULL,
    "riskPct" DOUBLE PRECISION,
    "rrr" DOUBLE PRECISION,
    "resultPct" DOUBLE PRECISION,
    "market" TEXT,
    "ruleCompliance" BOOLEAN NOT NULL DEFAULT true,
    "violationContent" TEXT,
    "violationMotive" TEXT,
    "analysis" TEXT,
    "psychology" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Week_startDate_key" ON "Week"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Review_evaluationId_key" ON "Review"("evaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_setupId_key" ON "Trade"("setupId");

-- AddForeignKey
ALTER TABLE "SetupImage" ADD CONSTRAINT "SetupImage_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "Setup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "Setup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "Setup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

