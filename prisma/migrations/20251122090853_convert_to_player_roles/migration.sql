/*
  Warnings:

  - You are about to drop the `captains` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `managers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mentors` table. If the table is not empty, all the data it contains will be lost.

*/

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('PLAYER', 'CAPTAIN', 'MENTOR', 'MANAGER');

-- CreateTable for player_roles first
CREATE TABLE "player_roles" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "role" "RoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "player_roles_playerId_role_key" ON "player_roles"("playerId", "role");

-- AddForeignKey
ALTER TABLE "player_roles" ADD CONSTRAINT "player_roles_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 1: Add PLAYER role to all existing players
INSERT INTO "player_roles" ("playerId", "role", "createdAt")
SELECT "id", 'PLAYER', CURRENT_TIMESTAMP
FROM "players";

-- Step 2: Migrate managers to players table and assign MANAGER role
INSERT INTO "players" ("clubId", "name", "email", "phone", "place", "dateOfBirth", "photo", "createdAt", "updatedAt")
SELECT "clubId", "name", "email", "phone", "place", "dateOfBirth", "photo", "createdAt", "updatedAt"
FROM "managers"
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "player_roles" ("playerId", "role", "createdAt")
SELECT p."id", 'MANAGER', m."createdAt"
FROM "managers" m
INNER JOIN "players" p ON p."email" = m."email";

-- Step 3: Migrate mentors to players table and assign MENTOR role
INSERT INTO "players" ("clubId", "name", "email", "phone", "place", "dateOfBirth", "photo", "createdAt", "updatedAt")
SELECT "clubId", "name", "email", "phone", "place", "dateOfBirth", "photo", "createdAt", "updatedAt"
FROM "mentors"
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "player_roles" ("playerId", "role", "createdAt")
SELECT p."id", 'MENTOR', m."createdAt"
FROM "mentors" m
INNER JOIN "players" p ON p."email" = m."email";

-- Step 4: Migrate captains to players table and assign CAPTAIN role
INSERT INTO "players" ("clubId", "name", "email", "phone", "place", "dateOfBirth", "photo", "createdAt", "updatedAt")
SELECT "clubId", "name", "email", "phone", "place", "dateOfBirth", "photo", "createdAt", "updatedAt"
FROM "captains"
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "player_roles" ("playerId", "role", "createdAt")
SELECT p."id", 'CAPTAIN', c."createdAt"
FROM "captains" c
INNER JOIN "players" p ON p."email" = c."email";

-- Step 5: Drop old tables
-- DropForeignKey
ALTER TABLE "captains" DROP CONSTRAINT "captains_clubId_fkey";
ALTER TABLE "managers" DROP CONSTRAINT "managers_clubId_fkey";
ALTER TABLE "mentors" DROP CONSTRAINT "mentors_clubId_fkey";

-- DropTable
DROP TABLE "captains";
DROP TABLE "managers";
DROP TABLE "mentors";
