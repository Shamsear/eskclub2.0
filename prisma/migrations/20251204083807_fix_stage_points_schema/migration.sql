/*
  Warnings:

  - You are about to drop the column `pointsForAdvancing` on the `stage_points` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pointSystemTemplateId,stageId]` on the table `stage_points` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stageId` to the `stage_points` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stage_points" DROP COLUMN "pointsForAdvancing",
ADD COLUMN     "pointsPerGoalConceded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsPerGoalScored" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stageId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stage_points_pointSystemTemplateId_stageId_key" ON "stage_points"("pointSystemTemplateId", "stageId");
