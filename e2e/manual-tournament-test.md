# Manual Tournament Workflow Test

This document outlines the manual testing steps for the complete tournament workflow.

## Prerequisites
- Application running on http://localhost:3000
- Admin user logged in (username: admin, password: admin123)
- At least 4 players from different clubs in the database

## Test Steps

### 1. Create New Tournament
1. Navigate to `/dashboard/tournaments`
2. Click "Create Tournament" button
3. Fill in the form:
   - Name: "E2E Test Tournament"
   - Description: "End-to-end test tournament"
   - Start Date: Today's date
   - End Date: 30 days from now
   - Verify default point values (Win: 3, Draw: 1, Loss: 0)
4. Click "Create Tournament"
5. **Expected**: Redirected to tournament details page
6. **Verify**: Tournament name and description are displayed

### 2. Add Participants from Multiple Clubs
1. On tournament details page, click "Add Participants" or navigate to participants section
2. **Expected**: See list of all players from all clubs
3. Select 4 players (preferably from different clubs)
4. Click "Add Participants"
5. **Expected**: Success message displayed
6. Navigate back to tournament details
7. **Verify**: Participant count shows 4 participants

### 3. Add Multiple Match Results

#### Match 1:
1. Click "Add Match Result"
2. Fill in:
   - Match Date: Today
   - Player 1: Select first participant, Outcome: WIN, Goals Scored: 3, Goals Conceded: 1
   - Click "Add Player" if needed
   - Player 2: Select second participant, Outcome: LOSS, Goals Scored: 1, Goals Conceded: 3
3. Click "Save" or "Add Match"
4. **Expected**: Redirected to tournament details
5. **Verify**: Match appears in matches list

#### Match 2:
1. Click "Add Match Result" again
2. Fill in:
   - Match Date: Today
   - Player 1: Select third participant, Outcome: DRAW, Goals Scored: 2, Goals Conceded: 2
   - Player 2: Select fourth participant, Outcome: DRAW, Goals Scored: 2, Goals Conceded: 2
3. Click "Save" or "Add Match"
4. **Expected**: Redirected to tournament details
5. **Verify**: Second match appears in matches list

### 4. View and Verify Leaderboard
1. Click on "Leaderboard" tab
2. **Expected**: See leaderboard table with all participants
3. **Verify**:
   - Player with WIN has 3 points (or 5 if point system was changed)
   - Players with DRAW have 1 point each
   - Player with LOSS has 0 points
   - Goals scored and conceded are correct
   - Players are sorted by points (descending)

### 5. Edit Tournament
1. Click "Edit Tournament"
2. Update:
   - Description: "Updated description for E2E test"
   - Points Per Win: 5
   - Points Per Goal Scored: 1
3. Click "Update Tournament"
4. **Expected**: Redirected to tournament details
5. **Verify**: Updated description is displayed

### 6. Edit Match Result
1. Navigate to "Matches" tab
2. Click "Edit" on the first match
3. Update:
   - Goals Scored for first player: 4 (was 3)
4. Click "Update Match"
5. **Expected**: Redirected to tournament details
6. Navigate to "Leaderboard" tab
7. **Verify**: Points have been recalculated (if point system includes goals)

### 7. Delete Tournament
1. On tournament details page, click "Delete Tournament"
2. **Expected**: Confirmation dialog appears
3. **Verify**: Warning message about deleting all data
4. Click "Confirm" or "Delete"
5. **Expected**: Redirected to tournaments list
6. **Verify**: Tournament no longer appears in the list

## Additional Tests

### Empty Tournament Test
1. Create a tournament without adding participants
2. Navigate to Leaderboard tab
3. **Expected**: Empty state message displayed

### Form Validation Test
1. Navigate to create tournament page
2. Try to submit empty form
3. **Expected**: Validation errors displayed
4. Fill name and dates with end date before start date
5. Try to submit
6. **Expected**: Date validation error displayed

## Success Criteria
- All steps complete without errors
- Data updates correctly throughout the workflow
- Leaderboard calculations are accurate
- Deletion cascades properly
- Validation works as expected
