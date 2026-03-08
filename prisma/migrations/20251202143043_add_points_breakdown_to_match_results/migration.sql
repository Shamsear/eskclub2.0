-- AlterTable
ALTER TABLE "match_results" ADD COLUMN     "basePoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "conditionalPoints" INTEGER NOT NULL DEFAULT 0;
