/*
  Warnings:

  - You are about to drop the column `pointsPerBoot` on the `point_system_templates` table. All the data in the column will be lost.
  - You are about to drop the column `pointsPerWalkover` on the `point_system_templates` table. All the data in the column will be lost.
  - You are about to drop the column `pointsPerBoot` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `pointsPerWalkover` on the `tournaments` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TournamentType" AS ENUM ('LEAGUE', 'KNOCKOUT', 'GROUP_STAGE', 'GROUP_KNOCKOUT', 'LEAGUE_KNOCKOUT', 'MIXED');

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "stageId" INTEGER,
ADD COLUMN     "stageName" VARCHAR(100);

-- AlterTable
ALTER TABLE "point_system_templates" DROP COLUMN "pointsPerBoot",
DROP COLUMN "pointsPerWalkover",
ADD COLUMN     "numberOfTeams" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsForWalkoverLoss" INTEGER NOT NULL DEFAULT -3,
ADD COLUMN     "pointsForWalkoverWin" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "tournamentType" "TournamentType" NOT NULL DEFAULT 'LEAGUE';

-- AlterTable
ALTER TABLE "tournaments" DROP COLUMN "pointsPerBoot",
DROP COLUMN "pointsPerWalkover",
ADD COLUMN     "pointsForWalkoverLoss" INTEGER NOT NULL DEFAULT -3,
ADD COLUMN     "pointsForWalkoverWin" INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "stage_points" (
    "id" SERIAL NOT NULL,
    "pointSystemTemplateId" INTEGER NOT NULL,
    "stageName" VARCHAR(100) NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "pointsForWin" INTEGER NOT NULL,
    "pointsForDraw" INTEGER NOT NULL,
    "pointsForLoss" INTEGER NOT NULL,
    "pointsForAdvancing" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "stage_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stage_points_pointSystemTemplateId_idx" ON "stage_points"("pointSystemTemplateId");

-- CreateIndex
CREATE INDEX "matches_stageId_idx" ON "matches"("stageId");

-- AddForeignKey
ALTER TABLE "stage_points" ADD CONSTRAINT "stage_points_pointSystemTemplateId_fkey" FOREIGN KEY ("pointSystemTemplateId") REFERENCES "point_system_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stage_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;
