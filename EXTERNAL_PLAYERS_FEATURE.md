# External Players Feature

## Overview
This feature allows admins to add match results where the second player (opponent) is from outside the club system. This is useful for tracking stats when club players compete against external opponents.

## Changes Made

### 1. Database Schema Updates
- **File**: `prisma/schema.prisma`
- Made `playerId` optional in the `MatchResult` model
- Changed `playerId` from `Int` to `Int?`
- Changed `player` relation from `Player` to `Player?`
- Applied migration using `npx prisma db push`

### 2. Match Result Form (Single Match)
- **File**: `components/MatchResultForm.tsx`
- Updated `PlayerResult` interface to allow `playerId: number | null`
- Modified validation schema to make `playerId` optional
- Updated player selection dropdown:
  - Player A: Required (must select from club members)
  - Player B: Optional - shows "External Player (not in club)" as default option
  - Added helper text explaining stats will only be tracked for Player A when Player B is external
- Updated form submission to filter out results with null `playerId`
- Changed initial state from `playerId: 0` to `playerId: null`

### 3. Match Result Form Page
- **File**: `app/dashboard/tournaments/[id]/matches/new/page.tsx`
- Updated page description to mention second player is optional
- Updated info card text to reflect optional second player for external opponents

### 4. Bulk Match Upload
- **File**: `components/BulkMatchUpload.tsx`
- Updated `FormMatch` interface to allow `playerBId: number | null`
- Modified Player B dropdown to show "External Player (not in club)" option for singles matches
- Added helper text for external player selection
- Updated validation logic:
  - Removed requirement for Player B in singles matches
  - Only validates player uniqueness if both players are selected
- Updated match outcome display condition to show when at least Player A is selected

## How It Works

### For Admins
1. When adding a single match or bulk matches, Player A must always be selected from club members
2. Player B can either be:
   - Selected from available club members (stats tracked for both)
   - Left as "External Player" (stats only tracked for Player A)
3. Match results, goals, and outcomes are still recorded normally
4. Points are calculated only for players with valid IDs

### Database Behavior
- Match results with `playerId = null` are stored but not linked to any player
- Player stats aggregations automatically skip null player IDs
- Leaderboards and statistics only include results with valid player IDs

## Benefits
1. **Flexibility**: Clubs can track their players' performance against external opponents
2. **Accurate Stats**: Internal player stats remain accurate even when playing external matches
3. **Complete Records**: All match history is preserved, including external matches
4. **No Data Loss**: Existing matches are unaffected by this change

## Technical Notes
- The unique constraint on `(matchId, playerId)` now only applies when `playerId IS NOT NULL`
- API endpoints automatically filter out null player IDs when calculating stats
- Frontend validation ensures at least one player (Player A) is always selected
- Doubles matches still require all 4 players to be from club members
