-- AlterTable
ALTER TABLE "point_system_templates" ADD COLUMN     "pointsPerBoot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsPerCleanSheet" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsPerStageDraw" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsPerStageWin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsPerWalkover" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "pointsPerBoot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsPerCleanSheet" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsPerStageDraw" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsPerStageWin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsPerWalkover" INTEGER NOT NULL DEFAULT 3;
