# Club Delete - Three Options

## Overview
Enhanced club deletion with three granular options giving admins complete control over data management:

1. **Delete Club Only** (Blue) - Safest option
2. **Delete Club and Players** (Orange) - Moderate option  
3. **Delete Everything** (Red) - Most destructive option

## Three Deletion Options

### Option 1: Delete Club Only
**Color:** Blue  
**Action:** Make all members free agents

**What Gets Deleted:**
- Club record
- Club stats (PlayerClubStats)

**What Gets Preserved:**
- All players (become free agents)
- All tournaments
- All match history
- Player stats
- Transfer history

**Use Case:** 
- Reorganizing club structure
- Temporarily removing a club
- Keeping player data for future use

### Option 2: Delete Club and Players
**Color:** Orange  
**Action:** Delete club and all members

**What Gets Deleted:**
- Club record
- All players/members
- Club stats (PlayerClubStats)
- Player roles

**What Gets Preserved:**
- Tournaments (but without player references)
- Match records (but player references may be null)
- Historical data structure

**Use Case:**
- Removing inactive club and members
- Cleaning up test data
- Members won't be used again

### Option 3: Delete Everything
**Color:** Red  
**Action:** Complete deletion with cascade

**What Gets Deleted:**
- Club record
- All players/members
- All tournaments
- All matches
- All stats
- Everything related to the club

**What Gets Preserved:**
- Nothing (complete removal)

**Use Case:**
- Complete cleanup
- Removing all traces
- Starting fresh

## Implementation Details

### ClubDetails Component

#### State Management
```typescript
const [deleteDialog, setDeleteDialog] = useState<{
  isOpen: boolean;
  playerAction: 'club-only' | 'club-and-players' | 'everything' | null;
}>({
  isOpen: false,
  playerAction: null,
});
```

#### Delete Handler Logic
```typescript
if (deleteDialog.playerAction === 'club-only') {
  // Make all players free agents
  await updatePlayersToFreeAgents();
  await deleteClub();
} else if (deleteDialog.playerAction === 'club-and-players') {
  // Delete all players first
  await deleteAllPlayers();
  await deleteClub();
} else if (deleteDialog.playerAction === 'everything') {
  // Cascade delete handles everything
  await deleteClub();
}
```

### ClubsList Component
Same implementation as ClubDetails for consistency.

## User Interface

### Visual Hierarchy
1. **Blue Option** (Top)
   - Safest choice
   - Preserves most data
   - Recommended for most cases

2. **Orange Option** (Middle)
   - Moderate destruction
   - Removes players but keeps history
   - Warning level

3. **Red Option** (Bottom)
   - Most destructive
   - Complete removal
   - Danger level

### Dialog Features
- **Header**: Red warning icon with "Delete Club" title
- **Info Box**: Shows club name and member counts
- **Radio Options**: Large clickable cards with checkmarks
- **Color Coding**: Blue → Orange → Red (increasing severity)
- **Descriptions**: Clear explanation of what gets deleted/preserved
- **Confirm Button**: 
  - Disabled until option selected
  - Color matches selected option
  - Shows loading state

## API Flow

### Club Only
```
1. PATCH /api/players/{id} (for each player)
   Body: { clubId: null, isFreeAgent: true }
2. DELETE /api/clubs/{id}
   Body: { deleteAction: 'club-only' }
```

### Club and Players
```
1. DELETE /api/players/{id} (for each player)
2. DELETE /api/clubs/{id}
   Body: { deleteAction: 'club-and-players' }
```

### Everything
```
1. DELETE /api/clubs/{id}
   Body: { deleteAction: 'everything' }
   (Cascade delete handles all related data)
```

## Database Behavior

### Foreign Key Constraints
- **Player.clubId**: `onDelete: SetNull` (for club-only option)
- **PlayerClubStats.clubId**: `onDelete: Cascade`
- **Tournament.clubId**: `onDelete: Cascade`
- **TeamMatchResult.clubId**: `onDelete: Cascade`
- **PlayerTransfer.fromClubId/toClubId**: `onDelete: SetNull`

### Cascade Behavior
When club is deleted:
- Club stats automatically deleted
- Tournaments cascade deleted (if configured)
- Players set to null (if using club-only)
- Players deleted (if using club-and-players)

## Testing Scenarios

### Test Club Only
1. Create club with 5 members
2. Add tournaments and matches
3. Delete club with "Club Only" option
4. Verify:
   - ✓ Club deleted
   - ✓ All 5 members are free agents
   - ✓ Tournaments still exist
   - ✓ Match history preserved
   - ✓ Members can join other clubs

### Test Club and Players
1. Create club with 5 members
2. Add tournaments and matches
3. Delete club with "Club and Players" option
4. Verify:
   - ✓ Club deleted
   - ✓ All 5 members deleted
   - ✓ Tournaments exist but no player refs
   - ✓ Match records exist but player refs null
   - ✓ No orphaned data

### Test Everything
1. Create club with 5 members
2. Add tournaments and matches
3. Delete club with "Everything" option
4. Verify:
   - ✓ Club deleted
   - ✓ All members deleted
   - ✓ All tournaments deleted
   - ✓ All matches deleted
   - ✓ Complete removal
   - ✓ No traces left

## Benefits

1. **Granular Control**: Three levels of deletion
2. **Data Safety**: Option to preserve data
3. **Flexibility**: Choose based on situation
4. **Clear Communication**: Visual and textual cues
5. **Reversibility**: Club-only option allows recovery
6. **Audit Trail**: Can preserve history while removing club

## User Guidance

### When to Use Each Option

**Use "Delete Club Only" when:**
- Reorganizing club structure
- Club is temporarily inactive
- Want to keep player data
- May recreate club later
- Need audit trail

**Use "Delete Club and Players" when:**
- Members are inactive
- Cleaning up old data
- Members won't be reused
- Want to keep tournament history
- Partial cleanup needed

**Use "Delete Everything" when:**
- Complete removal required
- Test data cleanup
- Starting completely fresh
- No historical data needed
- Compliance requirements

## Safety Features

1. **Required Selection**: Can't proceed without choosing
2. **Color Coding**: Visual severity indication
3. **Clear Descriptions**: Explains consequences
4. **Confirmation Required**: Two-step process
5. **Loading State**: Prevents double-clicks
6. **Error Handling**: User-friendly error messages
7. **No Accidental Deletion**: Must explicitly choose option
