-- CreateIndex
CREATE INDEX "clubs_name_idx" ON "clubs"("name");

-- CreateIndex
CREATE INDEX "clubs_createdAt_idx" ON "clubs"("createdAt");

-- CreateIndex
CREATE INDEX "player_roles_role_idx" ON "player_roles"("role");

-- CreateIndex
CREATE INDEX "player_roles_playerId_role_idx" ON "player_roles"("playerId", "role");

-- CreateIndex
CREATE INDEX "player_statistics_playerId_idx" ON "player_statistics"("playerId");

-- CreateIndex
CREATE INDEX "player_statistics_season_idx" ON "player_statistics"("season");

-- CreateIndex
CREATE INDEX "players_clubId_idx" ON "players"("clubId");

-- CreateIndex
CREATE INDEX "players_email_idx" ON "players"("email");

-- CreateIndex
CREATE INDEX "players_name_idx" ON "players"("name");

-- CreateIndex
CREATE INDEX "players_createdAt_idx" ON "players"("createdAt");
