# Tournament Participant Management API

This document describes the tournament participant management API routes implemented for Task 23.

## API Endpoints

### 1. Get Tournament Participants

**Endpoint:** `GET /api/tournaments/[id]/participants`

**Description:** Retrieves all participants for a specific tournament.

**Authentication:** Required (NextAuth session)

**Parameters:**
- `id` (path parameter): Tournament ID

**Response:**
```json
[
  {
    "id": 1,
    "tournamentId": 1,
    "playerId": 5,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "player": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "place": "New York",
      "dateOfBirth": "1995-05-15",
      "photo": "https://example.com/photo.jpg",
      "clubId": 1
    }
  }
]
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Tournament not found
- `400 Bad Request`: Invalid tournament ID

---

### 2. Add Participants to Tournament

**Endpoint:** `POST /api/tournaments/[id]/participants`

**Description:** Adds one or more players as participants to a tournament.

**Authentication:** Required (NextAuth session)

**Parameters:**
- `id` (path parameter): Tournament ID

**Request Body:**
```json
{
  "playerIds": [5, 7, 12]
}
```

**Validation Rules:**
- At least one player ID must be provided
- All player IDs must be positive integers
- All players must exist in the database
- All players must belong to the tournament's club
- Players cannot already be participants in the tournament

**Success Response (201 Created):**
```json
{
  "message": "Successfully added 3 participant(s) to the tournament",
  "participants": [
    {
      "id": 1,
      "tournamentId": 1,
      "playerId": 5,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "player": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "place": "New York",
        "dateOfBirth": "1995-05-15",
        "photo": "https://example.com/photo.jpg",
        "clubId": 1
      }
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Tournament or player(s) not found
- `400 Bad Request`: Invalid tournament ID or validation error
- `409 Conflict`: Player(s) already participants in the tournament

**Example Error (409 Conflict):**
```json
{
  "error": "Player(s) John Doe, Jane Smith are already participants in this tournament",
  "code": "CONFLICT"
}
```

**Example Error (400 Validation):**
```json
{
  "error": "Player(s) John Doe do not belong to the tournament's club",
  "code": "VALIDATION_ERROR"
}
```

---

### 3. Remove Participant from Tournament

**Endpoint:** `DELETE /api/tournaments/[id]/participants/[playerId]`

**Description:** Removes a player from a tournament. If the player has existing match results, they will be deleted along with the participant record, and a warning will be included in the response.

**Authentication:** Required (NextAuth session)

**Parameters:**
- `id` (path parameter): Tournament ID
- `playerId` (path parameter): Player ID

**Success Response (200 OK) - No Match Results:**
```json
{
  "message": "Participant John Doe removed from tournament"
}
```

**Success Response (200 OK) - With Match Results:**
```json
{
  "message": "Participant John Doe removed from tournament",
  "warning": "This player had 5 match result(s) which have been deleted",
  "deletedMatchResults": 5
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Tournament or participant not found
- `400 Bad Request`: Invalid tournament ID or player ID

**Transaction Behavior:**
When removing a participant with match results, the operation uses a database transaction to ensure data consistency:
1. Delete all match results for the player in this tournament
2. Delete tournament statistics for the player
3. Delete the participant record

If any step fails, all changes are rolled back.

---

## Implementation Details

### Technology Stack
- **Next.js 15**: Async params pattern
- **Prisma 6.1.0**: Database ORM with transaction support
- **Zod 3.24.1**: Request validation
- **NextAuth.js 4.24.11**: Authentication

### Key Features

1. **Async Params Support**: All routes use Next.js 15's async params pattern:
   ```typescript
   export async function GET(
     request: NextRequest,
     { params }: { params: Promise<{ id: string }> }
   ) {
     const { id } = await params;
     // ...
   }
   ```

2. **Club Validation**: Ensures players belong to the tournament's club before adding them as participants.

3. **Duplicate Prevention**: Checks for existing participants before adding new ones.

4. **Match Result Handling**: When removing a participant with match results:
   - Uses Prisma transactions for data consistency
   - Deletes match results first
   - Deletes tournament statistics
   - Finally removes the participant
   - Returns warning message with count of deleted results

5. **Comprehensive Error Handling**: Uses custom error classes (ValidationError, NotFoundError, ConflictError, UnauthorizedError) for consistent error responses.

### Database Schema

The implementation relies on these Prisma models:

```prisma
model TournamentParticipant {
  id           Int      @id @default(autoincrement())
  tournamentId Int
  playerId     Int
  createdAt    DateTime @default(now())

  tournament Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  player     Player     @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([tournamentId, playerId])
  @@index([tournamentId])
  @@index([playerId])
  @@map("tournament_participants")
}
```

### Usage Examples

#### Adding Participants
```typescript
// Client-side code
const response = await fetch(`/api/tournaments/${tournamentId}/participants`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    playerIds: [5, 7, 12]
  }),
});

const data = await response.json();
if (response.ok) {
  console.log(`Added ${data.participants.length} participants`);
} else {
  console.error(data.error);
}
```

#### Removing a Participant
```typescript
// Client-side code
const response = await fetch(
  `/api/tournaments/${tournamentId}/participants/${playerId}`,
  { method: 'DELETE' }
);

const data = await response.json();
if (response.ok) {
  if (data.warning) {
    console.warn(data.warning);
  }
  console.log(data.message);
} else {
  console.error(data.error);
}
```

## Testing Recommendations

1. **Unit Tests**: Test validation logic, error handling, and business rules
2. **Integration Tests**: Test database operations with test database
3. **E2E Tests**: Test complete workflows from UI to database

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- **11.1**: Display all players currently selected for a tournament ✓
- **11.2**: Display available players from the tournament's club ✓
- **11.3**: Add players to tournament roster ✓
- **11.4**: Remove players from roster with warning for existing match results ✓
- **11.5**: Show which players are already selected ✓
- **11.6**: Display warning about data loss when removing players with match results ✓
