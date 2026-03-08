-- ============================================
-- Eskimos 2.0 Database Schema (PostgreSQL)
-- ============================================

-- Create ENUM types
CREATE TYPE "RoleType" AS ENUM ('PLAYER', 'CAPTAIN', 'MENTOR', 'MANAGER');
CREATE TYPE "TournamentType" AS ENUM ('LEAGUE', 'KNOCKOUT', 'GROUP_STAGE', 'GROUP_KNOCKOUT', 'LEAGUE_KNOCKOUT', 'MIXED');
CREATE TYPE "MatchFormat" AS ENUM ('SINGLES', 'DOUBLES');
CREATE TYPE "RuleConditionType" AS ENUM ('GOALS_SCORED_THRESHOLD', 'GOALS_CONCEDED_THRESHOLD', 'GOAL_DIFFERENCE_THRESHOLD', 'CLEAN_SHEET');
CREATE TYPE "ComparisonOperator" AS ENUM ('EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL');
CREATE TYPE "MatchOutcome" AS ENUM ('WIN', 'DRAW', 'LOSS');

-- ============================================
-- Table: admins
-- ============================================
CREATE TABLE "admins" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "email" VARCHAR(100) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================
-- Table: clubs
-- ============================================
CREATE TABLE "clubs" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "logo" VARCHAR(255),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "clubs_name_idx" ON "clubs"("name");
CREATE INDEX "clubs_createdAt_idx" ON "clubs"("createdAt");

-- ============================================
-- Table: players
-- ============================================
CREATE TABLE "players" (
    "id" SERIAL PRIMARY KEY,
    "clubId" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) UNIQUE NOT NULL,
    "phone" VARCHAR(20),
    "place" VARCHAR(100),
    "dateOfBirth" DATE,
    "photo" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isFreeAgent" BOOLEAN NOT NULL DEFAULT false,
    "district" VARCHAR(100) NOT NULL DEFAULT '',
    "gender" VARCHAR(20) NOT NULL DEFAULT 'MALE',
    "state" VARCHAR(100) NOT NULL DEFAULT '',
    CONSTRAINT "players_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "players_clubId_idx" ON "players"("clubId");
CREATE INDEX "players_email_idx" ON "players"("email");
CREATE INDEX "players_name_idx" ON "players"("name");
CREATE INDEX "players_isFreeAgent_idx" ON "players"("isFreeAgent");
CREATE INDEX "players_createdAt_idx" ON "players"("createdAt");

-- ============================================
-- Table: player_club_stats
-- ============================================
CREATE TABLE "player_club_stats" (
    "id" SERIAL PRIMARY KEY,
    "playerId" INTEGER NOT NULL,
    "clubId" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "leftAt" TIMESTAMP(3),
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goalsScored" INTEGER NOT NULL DEFAULT 0,
    "goalsConceded" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "player_club_stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_club_stats_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "player_club_stats_playerId_idx" ON "player_club_stats"("playerId");
CREATE INDEX "player_club_stats_clubId_idx" ON "player_club_stats"("clubId");
CREATE INDEX "player_club_stats_joinedAt_idx" ON "player_club_stats"("joinedAt");

-- ============================================
-- Table: player_transfers
-- ============================================
CREATE TABLE "player_transfers" (
    "id" SERIAL PRIMARY KEY,
    "playerId" INTEGER NOT NULL,
    "fromClubId" INTEGER,
    "toClubId" INTEGER,
    "transferDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_transfers_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_transfers_fromClubId_fkey" FOREIGN KEY ("fromClubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "player_transfers_toClubId_fkey" FOREIGN KEY ("toClubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "player_transfers_playerId_idx" ON "player_transfers"("playerId");
CREATE INDEX "player_transfers_fromClubId_idx" ON "player_transfers"("fromClubId");
CREATE INDEX "player_transfers_toClubId_idx" ON "player_transfers"("toClubId");
CREATE INDEX "player_transfers_transferDate_idx" ON "player_transfers"("transferDate");

-- ============================================
-- Table: player_roles
-- ============================================
CREATE TABLE "player_roles" (
    "id" SERIAL PRIMARY KEY,
    "playerId" INTEGER NOT NULL,
    "role" "RoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_roles_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_roles_playerId_role_key" UNIQUE ("playerId", "role")
);

CREATE INDEX "player_roles_role_idx" ON "player_roles"("role");
CREATE INDEX "player_roles_playerId_role_idx" ON "player_roles"("playerId", "role");

-- ============================================
-- Table: point_system_templates
-- ============================================
CREATE TABLE "point_system_templates" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) UNIQUE NOT NULL,
    "description" TEXT,
    "pointsPerWin" INTEGER NOT NULL,
    "pointsPerDraw" INTEGER NOT NULL,
    "pointsPerLoss" INTEGER NOT NULL,
    "pointsPerGoalScored" INTEGER NOT NULL,
    "pointsPerGoalConceded" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pointsPerCleanSheet" INTEGER NOT NULL DEFAULT 0,
    "pointsPerStageDraw" INTEGER NOT NULL DEFAULT 0,
    "pointsPerStageWin" INTEGER NOT NULL DEFAULT 0,
    "numberOfTeams" INTEGER NOT NULL DEFAULT 0,
    "pointsForWalkoverLoss" INTEGER NOT NULL DEFAULT -3,
    "pointsForWalkoverWin" INTEGER NOT NULL DEFAULT 3,
    "tournamentType" "TournamentType" NOT NULL DEFAULT 'LEAGUE'
);

CREATE INDEX "point_system_templates_name_idx" ON "point_system_templates"("name");

-- ============================================
-- Table: stage_points
-- ============================================
CREATE TABLE "stage_points" (
    "id" SERIAL PRIMARY KEY,
    "pointSystemTemplateId" INTEGER NOT NULL,
    "stageName" VARCHAR(100) NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "pointsForWin" INTEGER NOT NULL,
    "pointsForDraw" INTEGER NOT NULL,
    "pointsForLoss" INTEGER NOT NULL,
    "pointsPerGoalConceded" INTEGER NOT NULL DEFAULT 0,
    "pointsPerGoalScored" INTEGER NOT NULL DEFAULT 0,
    "stageId" INTEGER NOT NULL,
    CONSTRAINT "stage_points_pointSystemTemplateId_fkey" FOREIGN KEY ("pointSystemTemplateId") REFERENCES "point_system_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stage_points_pointSystemTemplateId_stageId_key" UNIQUE ("pointSystemTemplateId", "stageId")
);

CREATE INDEX "stage_points_pointSystemTemplateId_idx" ON "stage_points"("pointSystemTemplateId");

-- ============================================
-- Table: conditional_rules
-- ============================================
CREATE TABLE "conditional_rules" (
    "id" SERIAL PRIMARY KEY,
    "templateId" INTEGER NOT NULL,
    "conditionType" "RuleConditionType" NOT NULL,
    "operator" "ComparisonOperator" NOT NULL,
    "threshold" INTEGER NOT NULL,
    "pointAdjustment" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "conditional_rules_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "point_system_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "conditional_rules_templateId_idx" ON "conditional_rules"("templateId");

-- ============================================
-- Table: tournaments
-- ============================================
CREATE TABLE "tournaments" (
    "id" SERIAL PRIMARY KEY,
    "clubId" INTEGER,
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
    "pointSystemTemplateId" INTEGER,
    "pointsPerCleanSheet" INTEGER NOT NULL DEFAULT 0,
    "pointsPerStageDraw" INTEGER NOT NULL DEFAULT 0,
    "pointsPerStageWin" INTEGER NOT NULL DEFAULT 0,
    "pointsForWalkoverLoss" INTEGER NOT NULL DEFAULT -3,
    "pointsForWalkoverWin" INTEGER NOT NULL DEFAULT 3,
    "matchFormat" "MatchFormat" NOT NULL DEFAULT 'SINGLES',
    CONSTRAINT "tournaments_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tournaments_pointSystemTemplateId_fkey" FOREIGN KEY ("pointSystemTemplateId") REFERENCES "point_system_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "tournaments_clubId_idx" ON "tournaments"("clubId");
CREATE INDEX "tournaments_startDate_idx" ON "tournaments"("startDate");
CREATE INDEX "tournaments_pointSystemTemplateId_idx" ON "tournaments"("pointSystemTemplateId");

-- ============================================
-- Table: tournament_participants
-- ============================================
CREATE TABLE "tournament_participants" (
    "id" SERIAL PRIMARY KEY,
    "tournamentId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tournament_participants_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tournament_participants_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tournament_participants_tournamentId_playerId_key" UNIQUE ("tournamentId", "playerId")
);

CREATE INDEX "tournament_participants_tournamentId_idx" ON "tournament_participants"("tournamentId");
CREATE INDEX "tournament_participants_playerId_idx" ON "tournament_participants"("playerId");

-- ============================================
-- Table: matches
-- ============================================
CREATE TABLE "matches" (
    "id" SERIAL PRIMARY KEY,
    "tournamentId" INTEGER NOT NULL,
    "matchDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stageId" INTEGER,
    "stageName" VARCHAR(100),
    "walkoverWinnerId" INTEGER,
    "isTeamMatch" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "matches_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "matches_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stage_points"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "matches_tournamentId_idx" ON "matches"("tournamentId");
CREATE INDEX "matches_stageId_idx" ON "matches"("stageId");
CREATE INDEX "matches_matchDate_idx" ON "matches"("matchDate");
CREATE INDEX "matches_isTeamMatch_idx" ON "matches"("isTeamMatch");

-- ============================================
-- Table: match_results
-- ============================================
CREATE TABLE "match_results" (
    "id" SERIAL PRIMARY KEY,
    "matchId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "outcome" "MatchOutcome" NOT NULL,
    "goalsScored" INTEGER NOT NULL DEFAULT 0,
    "goalsConceded" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "basePoints" INTEGER NOT NULL DEFAULT 0,
    "conditionalPoints" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "match_results_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "match_results_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "match_results_matchId_playerId_key" UNIQUE ("matchId", "playerId")
);

CREATE INDEX "match_results_matchId_idx" ON "match_results"("matchId");
CREATE INDEX "match_results_playerId_idx" ON "match_results"("playerId");

-- ============================================
-- Table: team_match_results
-- ============================================
CREATE TABLE "team_match_results" (
    "id" SERIAL PRIMARY KEY,
    "matchId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "teamPosition" INTEGER NOT NULL DEFAULT 1,
    "playerAId" INTEGER NOT NULL,
    "playerBId" INTEGER NOT NULL,
    "outcome" "MatchOutcome" NOT NULL,
    "goalsScored" INTEGER NOT NULL DEFAULT 0,
    "goalsConceded" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "basePoints" INTEGER NOT NULL DEFAULT 0,
    "conditionalPoints" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "team_match_results_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_match_results_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_match_results_playerAId_fkey" FOREIGN KEY ("playerAId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_match_results_playerBId_fkey" FOREIGN KEY ("playerBId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_match_results_matchId_teamPosition_key" UNIQUE ("matchId", "teamPosition")
);

CREATE INDEX "team_match_results_matchId_idx" ON "team_match_results"("matchId");
CREATE INDEX "team_match_results_clubId_idx" ON "team_match_results"("clubId");
CREATE INDEX "team_match_results_playerAId_idx" ON "team_match_results"("playerAId");
CREATE INDEX "team_match_results_playerBId_idx" ON "team_match_results"("playerBId");

-- ============================================
-- Table: tournament_player_stats
-- ============================================
CREATE TABLE "tournament_player_stats" (
    "id" SERIAL PRIMARY KEY,
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
    "conditionalPoints" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "tournament_player_stats_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tournament_player_stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tournament_player_stats_tournamentId_playerId_key" UNIQUE ("tournamentId", "playerId")
);

CREATE INDEX "tournament_player_stats_tournamentId_idx" ON "tournament_player_stats"("tournamentId");
CREATE INDEX "tournament_player_stats_playerId_idx" ON "tournament_player_stats"("playerId");
CREATE INDEX "tournament_player_stats_totalPoints_idx" ON "tournament_player_stats"("totalPoints");

-- ============================================
-- End of Schema
-- ============================================
