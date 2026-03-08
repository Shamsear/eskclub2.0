# Walkover Feature Implementation

## Overview
The walkover feature allows recording matches where one or both players didn't show up (forfeit/walkover).

## Database Changes
- Added `walkoverWinnerId` field to `Match` model
  - `null` = Normal match (no walkover)
  - `0` = Both players forfeited (no points awarded to either)
  - `playerId` = That player won by walkover

## Single Match Form

### UI Changes
- Added walkover selector dropdown with 3 options:
  1. **Normal Match** - Regular match with goals
  2. **Both Players Forfeited** - No points awarded to either player
  3. **Player X Won by Walkover** - Winner gets walkover win points, loser gets walkover loss points

### Behavior
- When walkover is selected:
  - Goal inputs are disabled and hidden
  - Goals are automatically set to 0
  - Outcomes are auto-calculated based on walkover selection
  - Points are calculated using `pointsForWalkoverWin` and `pointsForWalkoverLoss` from the point system template

## Point Calculation

### Normal Match
- Uses standard point system (win/draw/loss + goal points)

### Walkover Match
- **Winner**: Gets `pointsForWalkoverWin` points (default: 3)
- **Loser**: Gets `pointsForWalkoverLoss` points (default: -3)
- **Both Forfeit**: Both players get 0 points

## API Changes

### Match Creation Endpoint
`POST /api/tournaments/[id]/matches`

Added `walkoverWinnerId` field to request body:
```json
{
  "matchDate": "2024-12-04",
  "walkoverWinnerId": null | 0 | playerId,
  "results": [...]
}
```

### Validation
- `walkoverWinnerId` is optional and nullable
- When set, it overrides normal point calculations

## Bulk Match Upload

### ✅ Implemented
The bulk match upload feature now fully supports walkovers in both CSV and form modes:

1. **CSV Format**: Added `walkover` column (optional)
   - Empty or "normal" = normal match
   - "both" = both forfeited
   - Player name = that player won by walkover

2. **Form Mode**: Added walkover dropdown for each match row
   - Goals are disabled when walkover is selected
   - Outcome display shows walkover status

3. **API**: Updated bulk endpoint to handle walkover logic and calculate appropriate points

## Testing

### Test Cases
1. ✅ Normal match (no walkover)
2. ✅ Player A wins by walkover
3. ✅ Player B wins by walkover  
4. ✅ Both players forfeit
5. ⏳ Bulk upload with walkovers (pending implementation)

## Usage Example

```typescript
// Normal match
{
  matchDate: "2024-12-04",
  walkoverWinnerId: null,
  results: [
    { playerId: 1, outcome: "WIN", goalsScored: 3, goalsConceded: 1 },
    { playerId: 2, outcome: "LOSS", goalsScored: 1, goalsConceded: 3 }
  ]
}

// Player 1 wins by walkover
{
  matchDate: "2024-12-04",
  walkoverWinnerId: 1,
  results: [
    { playerId: 1, outcome: "WIN", goalsScored: 0, goalsConceded: 0 },
    { playerId: 2, outcome: "LOSS", goalsScored: 0, goalsConceded: 0 }
  ]
}

// Both forfeit
{
  matchDate: "2024-12-04",
  walkoverWinnerId: 0,
  results: [
    { playerId: 1, outcome: "LOSS", goalsScored: 0, goalsConceded: 0 },
    { playerId: 2, outcome: "LOSS", goalsScored: 0, goalsConceded: 0 }
  ]
}
```
