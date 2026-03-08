# Doubles Match Troubleshooting Guide

## Issue: "An unexpected error occurred" when submitting doubles match

### Quick Diagnosis Steps

1. **Open Browser Console** (Press F12)
   - Look for console logs starting with `=== Match Submission Data ===`
   - Check the error details in `=== API Error ===`

2. **Check Player Count**
   - Doubles matches require exactly 4 players
   - Singles matches require exactly 2 players
   - Verify all player dropdowns are filled

3. **Verify Club Assignments**
   - All players in doubles matches MUST belong to a club
   - Check player profiles to ensure clubId is set

### Common Errors and Solutions

#### Error: "Cannot read properties of undefined (reading 'create')"
**Cause**: Prisma client not regenerated after schema changes
**Solution**:
1. Stop the dev server (Ctrl+C)
2. Run `npx prisma generate`
3. Restart dev server with `npm run dev`

#### Error: "Team A/B: Both players must be from the same club"
**Cause**: Players on the same team are from different clubs
**Solution**: 
- Each team must have both players from the same club
- Team A: Both players must be from Club X (or both free agents)
- Team B: Both players must be from Club Y (or both free agents)
- Cross-club teams are NOT allowed

#### Error: "Team A/B: Both players must be from the same club or both must be free agents"
**Cause**: One player has a club, the other is a free agent
**Solution**:
- Either both players on a team must belong to the same club
- OR both players on a team must be free agents (no club)
- You cannot mix club players with free agents on the same team

#### Error: "Doubles matches require exactly 4 players"
**Cause**: Not all 4 player dropdowns are filled
**Solution**: 
- Select a player in each of the 4 dropdowns
- Team A: Player 1 and Player 2
- Team B: Player 1 and Player 2

#### Error: "Duplicate player IDs are not allowed"
**Cause**: Same player selected multiple times
**Solution**: Ensure all 4 players are different people

#### Error: "Player(s) [names] are not participants in this tournament"
**Cause**: Selected players haven't been added to the tournament
**Solution**:
1. Go to tournament participants page
2. Add the missing players
3. Return to match creation

### What Was Fixed

1. **Enhanced Validation**
   - Added strict player count validation (4 for doubles, 2 for singles)
   - Added club assignment validation for doubles matches
   - Better error messages that explain exactly what's wrong

2. **Improved Error Handling**
   - Specific error messages for each validation failure
   - Console logging for debugging
   - Proper error propagation from API to frontend

3. **Database Constraints**
   - Validates all players have clubs before creating team results
   - Ensures data integrity for doubles matches

### Testing Your Fix

1. **Create a Singles Match** (should work with 2 players)
2. **Create a Doubles Match** (should work with 4 players, all with clubs)
3. **Try Invalid Scenarios**:
   - Only 3 players selected → Should show error
   - Player without club → Should show error with player name
   - Duplicate player → Should show error

### Files Modified

- `lib/validations/match.ts` - Added player count validation
- `app/api/tournaments/[id]/matches/route.ts` - Enhanced validation and error handling
- `TEAM_MATCH_IMPLEMENTATION.md` - Updated documentation

### Next Steps

If you're still seeing "An unexpected error occurred":
1. Check the browser console for the actual error
2. Check the server logs for more details
3. Verify the database schema has the `TeamMatchResult` table
4. Ensure all migrations have been applied
