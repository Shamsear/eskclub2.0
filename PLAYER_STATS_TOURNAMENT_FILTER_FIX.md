# Player Statistics Tournament Filter - Fix

## Problem
The tournament filter tabs on `/dashboard/players` page were not working. Clicking on different tournaments did not update the displayed statistics.

## Root Cause
The `PlayerStatsClient` component had tournament filter UI (tabs) but was not actually filtering the data when a tournament was selected. The `selectedTournament` state was being updated, but the `players` array remained unchanged.

## Solution Implemented

### 1. Created Tournament-Specific Stats API
**File:** `app/api/tournaments/[id]/player-stats/route.ts`

- New endpoint: `GET /api/tournaments/{id}/player-stats`
- Fetches player statistics for a specific tournament
- Returns data in the same format as overall stats
- Filters out players with 0 matches
- Sorts by points, win rate, and goal difference

### 2. Updated Client Component
**File:** `components/PlayerStatsClient.tsx`

**Changes:**
- Added `useEffect` hook to fetch tournament-specific data when filter changes
- Added `isLoading` state to show loading indicator during data fetch
- Renamed `players` prop to `initialPlayers` to avoid confusion
- Created local `players` state that updates based on selected tournament
- Added loading spinner UI when fetching data

**Behavior:**
- When "Overall Stats" is selected → Shows initial overall data (no API call)
- When a specific tournament is selected → Fetches tournament-specific stats from API
- Loading state displayed during fetch
- Empty state shown if no data available for selected tournament

### 3. Data Flow

```
User clicks tournament tab
    ↓
selectedTournament state updates
    ↓
useEffect triggers
    ↓
API call to /api/tournaments/{id}/player-stats
    ↓
Tournament-specific stats fetched from database
    ↓
players state updated with new data
    ↓
Table re-renders with filtered data
```

## Features

### Tournament-Specific Stats Include:
- Total points in that tournament
- Matches played in that tournament
- Wins/Draws/Losses in that tournament
- Goals scored/conceded in that tournament
- Win rate for that tournament
- Average points per match in that tournament

### UI Improvements:
- Loading spinner during data fetch
- Smooth transition between tournaments
- Empty state message when no data available
- Maintains ranking display (🥇🥈🥉)

## Testing

To test the fix:
1. Navigate to `/dashboard/players`
2. Click on different tournament tabs
3. Verify that statistics update for each tournament
4. Check that "Overall Stats" shows combined data
5. Verify loading state appears during fetch
6. Check empty state for tournaments with no matches

## Technical Details

### API Response Format
```json
{
  "success": true,
  "players": [
    {
      "id": 1,
      "name": "Player Name",
      "email": "player@example.com",
      "photo": "url",
      "club": { "id": 1, "name": "Club Name", "logo": "url" },
      "totalPoints": 45,
      "totalMatches": 10,
      "totalWins": 7,
      "totalDraws": 2,
      "totalLosses": 1,
      "totalGoalsScored": 25,
      "totalGoalsConceded": 10,
      "goalDifference": 15,
      "winRate": 70.0,
      "avgPointsPerMatch": 4.50,
      "avgGoalsPerMatch": 2.50,
      "tournamentsPlayed": 1
    }
  ]
}
```

## Files Modified
1. `components/PlayerStatsClient.tsx` - Added filtering logic and loading state
2. `app/api/tournaments/[id]/player-stats/route.ts` - New API endpoint (created)

## Database Queries
The API uses the existing `TournamentPlayerStats` table which is already populated by the match result system, so no schema changes were needed.
