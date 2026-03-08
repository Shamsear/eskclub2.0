/*
  Warnings:

  - You are about to drop the `player_statistics` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MatchOutcome" AS ENUM ('WIN', 'DRAW', 'LOSS');

-- DropForeignKey
ALTER TABLE "player_statistics" DROP CONSTRAINT "player_statistics_playerId_fkey";

-- DropTable
DROP TABLE "player_statistics";

-- CreateTable
CREATE TABLE "tournaments" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "pointsPerWin" INTEGER NOT NULL DEFAULT 3,
    "pointsPerDraw" INTEGER NOT NULL DEFAULT 1,
    "pointsPerLoss" INTEGER NOT NULL DEFAULT 0,
    "pointsPerGoalScored" INTEGER NOT NULL DEFAULT 0,
    "pointsPerGoalConceded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_participants" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "matchDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "outcome" "MatchOutcome" NOT NULL,
    "goalsScored" INTEGER NOT NULL DEFAULT 0,
    "goalsConceded" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_player_stats" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goalsScored" INTEGER NOT NULL DEFAULT 0,
    "goalsConceded" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tournaments_clubId_idx" ON "tournaments"("clubId");

-- CreateIndex
CREATE INDEX "tournaments_startDate_idx" ON "tournaments"("startDate");

-- CreateIndex
CREATE INDEX "tournament_participants_tournamentId_idx" ON "tournament_participants"("tournamentId");

-- CreateIndex
CREATE INDEX "tournament_participants_playerId_idx" ON "tournament_participants"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_participants_tournamentId_playerId_key" ON "tournament_participants"("tournamentId", "playerId");

-- CreateIndex
CREATE INDEX "matches_tournamentId_idx" ON "matches"("tournamentId");

-- CreateIndex
CREATE INDEX "matches_matchDate_idx" ON "matches"("matchDate");

-- CreateIndex
CREATE INDEX "match_results_matchId_idx" ON "match_results"("matchId");

-- CreateIndex
CREATE INDEX "match_results_playerId_idx" ON "match_results"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_matchId_playerId_key" ON "match_results"("matchId", "playerId");

-- CreateIndex
CREATE INDEX "tournament_player_stats_tournamentId_idx" ON "tournament_player_stats"("tournamentId");

-- CreateIndex
CREATE INDEX "tournament_player_stats_playerId_idx" ON "tournament_player_stats"("playerId");

-- CreateIndex
CREATE INDEX "tournament_player_stats_totalPoints_idx" ON "tournament_player_stats"("totalPoints");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_player_stats_tournamentId_playerId_key" ON "tournament_player_stats"("tournamentId", "playerId");

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_player_stats" ADD CONSTRAINT "tournament_player_stats_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_player_stats" ADD CONSTRAINT "tournament_player_stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
