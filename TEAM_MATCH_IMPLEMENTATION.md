   # Team Match Implementation

   ## Overview
   This document describes the implementation of doubles/team match support in the tournament system. In doubles matches, 2v2 team matches affect only club/team stats, not individual player stats.

   ## Database Schema

   ### Match Model
   - `matchFormat`: SINGLES or DOUBLES (set at tournament level)
   - `isTeamMatch`: Boolean flag indicating if this is a team match

   ### TeamMatchResult Model
   Separate table for storing doubles match results:
   - `matchId`: Reference to the match
   - `clubId`: The club this team represents
   - `teamPosition`: 1 for Team A, 2 for Team B
   - `playerAId`: First player in the team
   - `playerBId`: Second player in the team
   - `outcome`: WIN, DRAW, or LOSS
   - `goalsScored`: Goals scored by this team
   - `goalsConceded`: Goals conceded by this team
   - `pointsEarned`: Total points earned
   - `basePoints`: Base points from outcome and goals
   - `conditionalPoints`: Additional points from conditional rules

   ## Implementation Status

   ### ✅ Completed

   1. **Database Schema**
      - Added `MatchFormat` enum (SINGLES/DOUBLES)
      - Added `matchFormat` field to Tournament model
      - Added `isTeamMatch` boolean to Match model
      - Created `TeamMatchResult` table for doubles matches
      - Migrations applied successfully

   2. **Validation Schemas**
      - Updated `lib/validations/tournament.ts` to include matchFormat
      - Updated `lib/validations/match.ts` to properly handle nullable stageId/stageName using `z.union([z.number(), z.null()])` instead of `.nullable()`

   3. **Tournament Management**
      - Tournament form includes Singles vs Doubles format selection
      - API routes handle matchFormat in POST/PUT operations
      - Tournament edit page passes matchFormat to form

   4. **Match Creation**
      - Match creation API uses `TeamMatchResult` for doubles matches
      - Match result form shows 2 players for singles, 4 players (2 teams) for doubles
      - Team groupings with visual distinction (Team A in blue, Team B in purple)
      - Goals input properly batched to update all 4 players at once
      - Player filtering prevents selected players from appearing in other dropdowns
      - Auto-calculation of outcomes based on team goals

   5. **Match Editing**
      - Match edit API updated to handle `TeamMatchResult` for doubles matches
      - Match edit page fetches both `results` and `teamResults`
      - Converts team results to individual player results for form display
      - Properly saves back to `TeamMatchResult` table for doubles matches

   6. **Match Retrieval**
      - GET endpoints fetch both `results` and `teamResults`
      - Match edit page converts team results to form format

   7. **Bulk Upload**
      - Updated to support 4 players for doubles format
      - CSV parsing validates 4 players for doubles matches
      - Proper validation and error handling

   8. **Statistics**
      - Singles matches update `tournament_player_stats` table
      - Doubles matches do NOT update `tournament_player_stats` (only club/team stats)
      - Statistics calculation skipped for team matches

   ### 🔄 Recent Fixes (Current Session)

   1. **Validation Schema Fix**
      - Changed `stageId` and `stageName` from `.nullable()` to `z.union([z.number(), z.null()])` and `z.union([z.string(), z.null()])`
      - This properly handles null values being sent from the frontend
      - Fixed the ZodError: "Expected number, received null" issue

   2. **Match Edit API Enhancement**
      - Added support for `TeamMatchResult` in PUT endpoint
      - Fetches and returns both `results` and `teamResults` in GET endpoint
      - Properly deletes and recreates team results on update
      - Handles player IDs from team results in DELETE endpoint

   3. **Match Edit Page Enhancement**
      - Fetches both `results` and `teamResults` from database
      - Converts team results to individual player results for form
      - Properly passes `matchFormat` to form component

   4. **Enhanced Validation for Doubles Matches**
      - Added validation to ensure exactly 4 players for doubles matches
      - Added validation to ensure exactly 2 players for singles matches
      - Added validation to ensure all players in doubles matches belong to clubs
      - Improved error messages to clearly indicate what went wrong

   5. **Better Error Handling**
      - Added specific error messages for player count mismatches
      - Added validation for club assignments in doubles matches
      - Console logging in frontend for debugging submission issues

   6. **Team Composition Validation**
      - Both players on a team must be from the same club OR both must be free agents
      - Cross-club teams are NOT allowed (e.g., Player from Club A + Player from Club B)
      - Mixed teams are NOT allowed (e.g., Club player + Free agent)
      - Validation applies to both Team A and Team B

   7. **Smart Player Filtering in UI**
      - Bidirectional filtering: When Player 1 is selected, Player 2 is filtered AND vice versa
      - When selecting Team A Player 1, Team A Player 2 dropdown automatically filters to show only:
      - Players from the same club (if Player 1 has a club)
      - OR only free agents (if Player 1 is a free agent)
      - Same logic applies to Team B
      - Prevents invalid team compositions before submission
      - Improves user experience by showing only valid options
      - Implemented in:
      - Single match entry form (`MatchResultForm`)
      - Bulk match upload form (`BulkMatchUpload`)
      - Match edit form (uses `MatchResultForm`)

   8. **Prisma Client Regeneration**
      - Regenerated Prisma client to include `TeamMatchResult` model
      - Fixed "Cannot read properties of undefined (reading 'create')" error
      - Command: `npx prisma generate`

   9. **TypeScript Build Fixes**
      - Added `pointsForWalkoverWin` and `pointsForWalkoverLoss` to `PointSystemConfig` interface
      - Made `playerId` optional in `MatchResultData` interface (not used in point calculations)
      - Added explicit type annotations for `playerC` and `playerD` in bulk upload
      - Fixed `TournamentDetailsClient` to include `isTeamMatch` and `teamResults` in matches type
      - Fixed leaderboard players page to properly filter null values with type predicate
      - Fixed e2e test to use `.locator().first().click()` instead of `.click().first()`

   ## Troubleshooting

   ### "An unexpected error occurred" when submitting doubles match

   Check the browser console (F12) for detailed error logs. Common issues:

   1. **Player count mismatch**: Doubles matches require exactly 4 players
      - Error: "Doubles matches require exactly 4 players (2 teams of 2). Received X player(s)."
      - Solution: Ensure all 4 player dropdowns are filled

   2. **Players without clubs**: All players in doubles matches must belong to a club
      - Error: "All players in doubles matches must belong to a club. Players without clubs: [names]"
      - Solution: Assign clubs to all players before creating doubles matches

   3. **Duplicate players**: All 4 players must be different
      - Error: "Duplicate player IDs are not allowed in match results"
      - Solution: Select 4 different players

   4. **Missing participants**: Players must be tournament participants
      - Error: "Player(s) [names] are not participants in this tournament"
      - Solution: Add players to tournament participants first

   9. **Match Display Components (MatchTheater)**
      - Updated `components/public/MatchTheater.tsx` to handle both singles and doubles matches
      - Added conditional rendering based on `isTeamMatch` flag
      - Created `TeamPerformanceCard` component for displaying team results
      - Shows club logo, both team members, and team statistics
      - Updated hero section to show "Doubles Match" and "2v2 Format" badge for team matches
      - Updated stats section to calculate totals correctly for both match types
      - Purple theme for team cards to distinguish from singles (orange theme)

   10. **Match Display Components (MatchList)**
      - Already supports doubles matches with 2v2 display
      - Shows team compositions with club logos
      - Displays both players for each team
      - Visual distinction with purple theme for doubles

   11. **Tournament Statistics**
      - Updated `app/tournaments/[id]/page.tsx` to calculate total goals from both singles and doubles matches
      - Aggregates goals from both `matchResult` and `teamMatchResult` tables
      - Correctly displays total goals for mixed or doubles-only tournaments
      - Fixed completed matches count to check both `results` and `teamResults` based on match type
      - Now correctly shows progress for doubles tournaments

   12. **Tournament Leaderboard**
      - Already supports team leaderboards for doubles tournaments
      - Shows team composition with both players
      - Displays club logo and team stats
      - Updated stat cards to show "Total Teams" instead of "Total Players" for doubles
      - Updated "Current Leader" to show team name for doubles tournaments

   13. **Public Matches List**
      - Updated `/api/matches` endpoint to include `teamResults` data
      - Updated `MatchesList` component to display both singles and doubles matches
      - Added `TeamSlot` component for displaying team match cards
      - Purple gradient header for doubles matches (vs orange for singles)
      - Shows "2v2" badge for team matches
      - Displays both players for each team with club logo
      - Shows team outcome, points, and goals

   ### 📋 Next Steps (If Needed)

   1. **Club Statistics**
      - Implement club statistics calculation for team matches
      - Aggregate team match results for club leaderboards
      - Add club leaderboard page showing team match performance

   2. **Testing**
      - End-to-end testing of creating doubles matches
      - End-to-end testing of editing doubles matches
      - Verify statistics are NOT updated for doubles matches
      - Test bulk upload with doubles format
      - Test public match display for both singles and doubles
      - Test tournament stats display for doubles tournaments
      - Test leaderboard display for team rankings

   ## Key Design Decisions

   1. **Separate Table for Team Results**
      - Keeps singles and doubles data separate
      - Prevents confusion in statistics calculation
      - Allows for club-level aggregation

   2. **Tournament-Level Match Format**
      - Match format is set at tournament level, not per-match
      - All matches in a tournament use the same format
      - Simplifies UI and reduces user error

   3. **Form Representation**
      - Doubles form shows 4 individual players grouped into 2 teams
      - Goals are entered once per team and applied to both players
      - Outcomes are auto-calculated based on goals

   4. **Statistics Separation**
      - Singles matches affect individual player stats
      - Doubles matches affect only club/team stats
      - Clear separation prevents stat pollution

   ## API Endpoints

   ### Match Creation
   - `POST /api/tournaments/[id]/matches`
   - Checks `tournament.matchFormat` to determine if team match
   - Creates `TeamMatchResult` entries for doubles
   - Creates `MatchResult` entries for singles

   ### Match Update
   - `PUT /api/matches/[id]`
   - Checks `tournament.matchFormat` to determine if team match
   - Deletes and recreates appropriate result type
   - Updates statistics only for singles matches

   ### Match Retrieval
   - `GET /api/matches/[id]`
   - Returns both `results` and `teamResults`
   - Frontend determines which to use based on `isTeamMatch` flag

   ## Form Behavior

   ### Singles (2 players)
   - Player A vs Player B
   - Each player enters goals scored
   - Goals conceded auto-calculated
   - Outcomes auto-calculated based on goals

   ### Doubles (4 players, 2 teams)
   - Team A (Player 1 + Player 2) vs Team B (Player 1 + Player 2)
   - Each team enters goals scored once
   - Goals applied to both players in the team
   - Goals conceded auto-calculated for opposing team
   - Outcomes auto-calculated based on team goals
   - Selected players filtered from other dropdowns

   ## Validation Rules

   1. **Match Format Validation**
      - Tournament must have a valid matchFormat (SINGLES or DOUBLES)
      - Cannot be changed after tournament has matches

   2. **Player Count Validation**
      - Singles: Exactly 2 players required
      - Doubles: Exactly 4 players required

   3. **Stage Validation**
      - `stageId` and `stageName` are optional (nullable)
      - Properly handled with `z.union([z.number(), z.null()])` syntax

   4. **Player Uniqueness**
      - No duplicate players in a single match
      - All players must be tournament participants

   ## Files Modified

   ### Validation
   - `lib/validations/match.ts` - Fixed nullable field handling

   ### API Routes
   - `app/api/matches/[id]/route.ts` - Added TeamMatchResult support for GET/PUT/DELETE
   - `app/api/tournaments/[id]/matches/route.ts` - Already had TeamMatchResult support for POST

   ### Pages
   - `app/dashboard/tournaments/[id]/matches/[matchId]/edit/page.tsx` - Fetches and converts team results
   - `app/matches/[id]/page.tsx` - Already fetches both results and teamResults
   - `app/tournaments/[id]/page.tsx` - Updated to aggregate goals from both singles and doubles matches
   - `app/tournaments/[id]/leaderboard/page.tsx` - Already supports team leaderboards, updated stat labels

   ### Components
   - `components/MatchResultForm.tsx` - Already had doubles support with proper goals batching and player filtering
   - `components/MatchList.tsx` - Already had doubles support with 2v2 display
   - `components/public/MatchTheater.tsx` - Added doubles support with TeamPerformanceCard component
   - `components/public/LeaderboardStream.tsx` - Already supports team display
