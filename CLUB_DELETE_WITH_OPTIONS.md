# Club Delete with Member Options

## Overview
Enhanced club deletion functionality to give admins control over what happens to club members when deleting a club. Admins can now choose between:
1. **Make Members Free Agents** - Keep member data, remove club association
2. **Delete Everything** - Permanently delete club and all members

## Changes Made

### 1. Club Details Component (`components/ClubDetails.tsx`)

#### Updated State
```typescript
const [deleteDialog, setDeleteDialog] = useState<{
  isOpen: boolean;
  playerAction: 'free-agent' | 'delete' | null;
}>({
  isOpen: false,
  playerAction: null,
});
```

#### Updated Delete Handler
- Checks which action was selected
- If "free-agent": Updates all members to be free agents before deleting club
- If "delete": Deletes club (cascade delete handles members)
- Fetches all unique member IDs from managers, mentors, captains, and players
- Uses PATCH endpoint to update each player

#### Custom Delete Dialog
Replaced ConfirmDialog with custom dialog featuring:
- Club information display (name, member counts)
- Two radio-style options with clear descriptions
- Visual distinction (blue for free agent, red for delete)
- Disabled confirm button until option is selected
- Loading state during deletion

### 2. Clubs List Component (`components/ClubsList.tsx`)

#### Same Updates Applied
- Updated state to include `playerAction`
- Modified delete handler to fetch hierarchy and update members
- Replaced ConfirmDialog with custom dialog
- Consistent UI/UX with ClubDetails

### 3. Player API Route (`app/api/players/[id]/route.ts`)

Already has PATCH endpoint that supports:
```typescript
PATCH /api/players/[id]
Body: { clubId: null, isFreeAgent: true }
```

## User Flow

### From Club Detail Page or Clubs List

1. Admin clicks "Delete" button on a club
2. Custom dialog appears with two options:
   - **Make Members Free Agents**: Blue option, preserves data
   - **Delete Everything**: Red option, permanent deletion
3. Admin selects one option (confirm button enables)
4. Admin clicks "Delete Club"
5. System processes the request:
   - **Free Agent Option**:
     - Fetches all club members
     - Updates each member: `clubId = null`, `isFreeAgent = true`
     - Deletes the club
   - **Delete Everything Option**:
     - Deletes club (cascade deletes members via database constraints)
6. User redirected to clubs list
7. Success confirmation

## Technical Implementation

### Free Agent Flow
```javascript
// 1. Get all unique member IDs
const uniqueMemberIds = new Set<number>();
[...managers, ...mentors, ...captains, ...players].forEach(member => {
  uniqueMemberIds.add(member.id);
});

// 2. Update each player to be a free agent
const updatePromises = Array.from(uniqueMemberIds).map(playerId =>
  fetch(`/api/players/${playerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clubId: null, isFreeAgent: true }),
  })
);

await Promise.all(updatePromises);

// 3. Delete the club
await fetch(`/api/clubs/${club.id}`, { method: 'DELETE' });
```

### Delete Everything Flow
```javascript
// Database cascade delete handles everything
await fetch(`/api/clubs/${club.id}`, { 
  method: 'DELETE',
  body: JSON.stringify({ deleteMembers: true })
});
```

## Database Behavior

### Free Agent Option
- Players: `clubId` set to NULL, `isFreeAgent` set to TRUE
- Club stats: Cascade deleted (configured in schema)
- Transfers: Club references set to NULL (configured in schema)
- Match results: Preserved (players still exist)
- Tournaments: Cascade deleted with club

### Delete Everything Option
- Players: Cascade deleted (if configured) or orphaned
- All related data: Cascade deleted based on schema configuration
- Match results: Handled based on foreign key constraints
- Complete removal of club and all associations

## UI/UX Features

### Visual Design
- **Warning Icon**: Red warning triangle in dialog header
- **Club Info Box**: Gray box showing club name and member counts
- **Radio Options**: Large clickable cards with checkmarks
- **Color Coding**: Blue for safe option, red for destructive option
- **Descriptions**: Clear explanation of each option's consequences

### User Safety
- Requires explicit option selection
- Confirm button disabled until choice is made
- Clear warning about permanent deletion
- Loading state prevents double-clicks
- Error handling with user-friendly messages

### Accessibility
- Keyboard navigation support
- Clear visual feedback for selected option
- Descriptive text for screen readers
- Proper focus management

## Benefits

1. **Data Preservation**: Option to keep member data for future use
2. **Flexibility**: Admins choose based on their needs
3. **Clarity**: Clear explanation of consequences
4. **Safety**: Prevents accidental data loss
5. **Consistency**: Same experience in both club detail and list views

## Testing Scenarios

### Test Free Agent Option
1. Create a club with multiple members
2. Click delete on the club
3. Select "Make Members Free Agents"
4. Confirm deletion
5. Verify:
   - Club is deleted
   - Members appear in free agents list
   - Members have no club association
   - Match history is preserved

### Test Delete Everything Option
1. Create a club with members and matches
2. Click delete on the club
3. Select "Delete Everything"
4. Confirm deletion
5. Verify:
   - Club is deleted
   - Members are deleted
   - All related data is removed
   - No orphaned records

## Future Enhancements

Potential improvements:
- Show member count in dialog
- Preview which members will be affected
- Option to selectively keep certain members
- Bulk operations for multiple clubs
- Undo functionality (within time window)
- Export data before deletion
