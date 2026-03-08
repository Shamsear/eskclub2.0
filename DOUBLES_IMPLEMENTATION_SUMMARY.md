# Doubles/Team Match Implementation Summary

## Overview
Added support for doubles (2v2) team matches in tournaments. Team match results affect only club/team statistics, not individual player stats.

## Database Changes

### Schema Updates
1. **New Enum**: `MatchFormat` with values `SINGLES` and `DOUBLES`
2. **Tournament Model**: Added `matchFormat` field (defaults to `SINGLES`)
3. **Match Model**: Added `isTeamMatch` boolean field (defaults to `false`)

### Migration
- Migration file: `20260304163118_add_match_format_to_tournaments`
- Status: ✅ Applied to database

## Implementation Details

### 1. Tournament Creation/Editing
**Files Modified:**
- `lib/validations/tournament.ts` - Added matchFormat to validation schemas
- `components/TournamentForm.tsx` - Added UI for match format selection
- `app/api/tournaments/route.ts` - Handle matchFormat in POST
- `app/api/clubs/[id]/tournaments/route.ts` - Handle matchFormat in POST

**Features:**
- Radio button selection between Singles (1v1) and Doubles (2v2)
- Clear descriptions for each format
- Defaults to SINGLES for backward compatibility

### 2. Match Creation
**Files Modified:**
- `app/dashboard/tournaments/[id]/matches/new/page.tsx` - Fetch and pass matchFormat
- `components/MatchResultForm.tsx` - Support 4 players for doubles matches
- `app/api/tournaments/[id]/matches/route.ts` - Set isTeamMatch based on tournament format

**Features:**
- Singles tournaments: 2 player slots (1v1)
- Doubles tournaments: 4 player slots (2v2)
- Dynamic UI text based on match format

### 3. Match Editing/Deletion
**Files Modified:**
- `app/api/matches/[id]/route.ts` - Check matchFormat for stats updates

**Features:**
- GET: Fetch tournament matchFormat
- PUT: Skip individual stats update for team matches
- DELETE: Skip individual stats update for team matches

### 4. Statistics Calculation
**Logic:**
- Singles matches (`matchFormat: SINGLES`, `isTeamMatch: false`):
  - Updates individual player tournament stats
  - Affects player leaderboards
  
- Doubles matches (`matchFormat: DOUBLES`, `isTeamMatch: true`):
  - Does NOT update individual player stats
  - Results aggregate to club/team stats only
  - Players' individual records remain unaffected

## How It Works

### Creating a Singles Tournament
1. Go to Create Tournament
2. Select "Singles (1v1)" format
3. All matches in this tournament will be 1v1
4. Match results affect individual player stats

### Creating a Doubles Tournament
1. Go to Create Tournament
2. Select "Doubles (2v2)" format
3. All matches in this tournament will be 2v2
4. Match results affect only team/club stats

### Adding a Match
1. Navigate to tournament
2. Click "Add Match"
3. Form automatically shows:
   - 2 player slots for singles tournaments
   - 4 player slots for doubles tournaments
4. Enter match details and submit
5. Stats are updated accordingly

## Database Fields

### Tournament
```typescript
{
  matchFormat: 'SINGLES' | 'DOUBLES'  // Default: 'SINGLES'
}
```

### Match
```typescript
{
  isTeamMatch: boolean  // Default: false
  // Set to true automatically for DOUBLES tournaments
}
```

## API Changes

### POST /api/tournaments
**Request Body:**
```json
{
  "name": "Tournament Name",
  "matchFormat": "SINGLES" | "DOUBLES",
  // ... other fields
}
```

### POST /api/tournaments/[id]/matches
**Behavior:**
- Checks tournament's `matchFormat`
- Sets `isTeamMatch: true` for DOUBLES tournaments
- Skips `updatePlayerStatistics()` for team matches

### PUT /api/matches/[id]
**Behavior:**
- Checks tournament's `matchFormat`
- Skips `updatePlayerStatistics()` for team matches

### DELETE /api/matches/[id]
**Behavior:**
- Checks tournament's `matchFormat`
- Skips `updatePlayerStatistics()` for team matches

## Testing Checklist

- [ ] Create a singles tournament
- [ ] Create a doubles tournament
- [ ] Add a match to singles tournament (verify 2 player slots)
- [ ] Add a match to doubles tournament (verify 4 player slots)
- [ ] Verify singles match updates player stats
- [ ] Verify doubles match does NOT update player stats
- [ ] Edit a singles match
- [ ] Edit a doubles match
- [ ] Delete a singles match
- [ ] Delete a doubles match
- [ ] Check leaderboard shows only singles match results

## Next Steps (Optional Enhancements)

1. **UI Improvements:**
   - Show team groupings in doubles match display (Team A vs Team B)
   - Add team names/labels in match results
   - Visual distinction between singles and doubles matches in lists

2. **Team Statistics:**
   - Create dedicated team stats tracking
   - Team leaderboard for doubles tournaments
   - Team performance analytics

3. **Bulk Match Upload:**
   - Update bulk upload to support doubles format
   - CSV template for team matches

4. **Match Display:**
   - Update match list to show team compositions
   - Group players by team in match details

## Notes

- All existing tournaments default to SINGLES format (backward compatible)
- All existing matches have `isTeamMatch: false` (backward compatible)
- Individual player stats are preserved and unaffected by team matches
- The system is fully backward compatible with existing data
