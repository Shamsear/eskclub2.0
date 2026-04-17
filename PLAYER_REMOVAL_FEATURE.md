# Player Removal Feature

## Overview
Added functionality to remove players from clubs directly from the club detail page with two options:
1. **Make Free Agent** - Remove player from club but keep their data
2. **Delete Completely** - Permanently delete player and all their data

## Changes Made

### 1. Club Details Component (`components/ClubDetails.tsx`)

#### Updated MemberCard Component
- Added `onRemove` callback prop
- Added remove button (trash icon) to each member card
- Button triggers removal dialog when clicked

#### Added State Management
```typescript
const [removePlayerDialog, setRemovePlayerDialog] = useState<{
  isOpen: boolean;
  playerId: number | null;
  playerName: string;
  action: 'free-agent' | 'delete' | null;
}>({
  isOpen: false,
  playerId: null,
  playerName: '',
  action: null,
});
```

#### Added Handler Functions
- `handleRemovePlayer(playerId, playerName)` - Opens the removal dialog
- `handleRemovePlayerConfirm()` - Executes the selected action (free agent or delete)

#### Custom Removal Dialog
Created a custom dialog with two radio-style options:
- **Make Free Agent**: Removes player from club, sets `clubId` to null and `isFreeAgent` to true
- **Delete Completely**: Permanently deletes the player from the database

### 2. Player API Route (`app/api/players/[id]/route.ts`)

#### Added PATCH Method
New endpoint to partially update player data:
```typescript
PATCH /api/players/[id]
```

**Request Body:**
```json
{
  "clubId": null,
  "isFreeAgent": true
}
```

**Features:**
- Validates authentication
- Checks if player exists
- Updates only provided fields
- Returns updated player with roles and club data

**Use Cases:**
- Making a player a free agent
- Moving player between clubs
- Updating player status

### 3. Database Schema
Already configured with proper cascade/set null actions:
- `Player.clubId` can be null (free agents)
- `Player.isFreeAgent` boolean flag
- Proper foreign key constraints

## User Flow

### From Club Detail Page (`/dashboard/clubs/[id]`)

1. Admin clicks the trash icon on any member card
2. Dialog appears with player name and two options
3. Admin selects one option:
   - **Make Free Agent**: Player removed from club, becomes available for other clubs
   - **Delete Completely**: Player and all data permanently deleted
4. Admin clicks confirm button
5. Action is executed via API
6. Page refreshes to show updated member list

## API Endpoints Used

### Make Free Agent
```
PATCH /api/players/[id]
Body: { clubId: null, isFreeAgent: true }
```

### Delete Player
```
DELETE /api/players/[id]
```

## Benefits

1. **Flexibility**: Admins can choose between removing from club or deleting completely
2. **Data Preservation**: Free agent option keeps player data for potential future use
3. **Clean Interface**: Action available directly from club detail page
4. **Clear Options**: Dialog clearly explains the difference between the two actions
5. **Safety**: Confirmation required before any action

## UI/UX Features

- Visual distinction between the two options (blue for free agent, red for delete)
- Radio-style selection with checkmarks
- Descriptive text explaining each option
- Disabled confirm button until an option is selected
- Loading state during processing
- Error handling with user-friendly messages

## Testing

To test the feature:
1. Navigate to a club detail page with members
2. Click the trash icon on a member card
3. Select "Make Free Agent" and confirm
   - Player should be removed from club
   - Player should appear in free agents list
4. Add the player back to a club
5. Click trash icon again
6. Select "Delete Completely" and confirm
   - Player should be permanently deleted
   - Player should not appear anywhere in the system
