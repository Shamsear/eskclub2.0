-- CreateEnum
CREATE TYPE "RuleConditionType" AS ENUM ('GOALS_SCORED_THRESHOLD', 'GOALS_CONCEDED_THRESHOLD', 'GOAL_DIFFERENCE_THRESHOLD', 'CLEAN_SHEET');

-- CreateEnum
CREATE TYPE "ComparisonOperator" AS ENUM ('EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL');

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "pointSystemTemplateId" INTEGER;

-- CreateTable
CREATE TABLE "point_system_templates" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "pointsPerWin" INTEGER NOT NULL,
    "pointsPerDraw" INTEGER NOT NULL,
    "pointsPerLoss" INTEGER NOT NULL,
    "pointsPerGoalScored" INTEGER NOT NULL,
    "pointsPerGoalConceded" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "point_system_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conditional_rules" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "conditionType" "RuleConditionType" NOT NULL,
    "operator" "ComparisonOperator" NOT NULL,
    "threshold" INTEGER NOT NULL,
    "pointAdjustment" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conditional_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "point_system_templates_name_key" ON "point_system_templates"("name");

-- CreateIndex
CREATE INDEX "point_system_templates_name_idx" ON "point_system_templates"("name");

-- CreateIndex
CREATE INDEX "conditional_rules_templateId_idx" ON "conditional_rules"("templateId");

-- CreateIndex
CREATE INDEX "tournaments_pointSystemTemplateId_idx" ON "tournaments"("pointSystemTemplateId");

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_pointSystemTemplateId_fkey" FOREIGN KEY ("pointSystemTemplateId") REFERENCES "point_system_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conditional_rules" ADD CONSTRAINT "conditional_rules_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "point_system_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
