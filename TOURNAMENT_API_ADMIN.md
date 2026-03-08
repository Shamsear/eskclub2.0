# Admin-Hosted Tournament API

This document describes the updated tournament API that supports admin-hosted tournaments (tournaments not associated with any specific club).

## Changes Made

### 1. Database Schema Update
- Made `clubId` field optional (nullable) in the `Tournament` model
- Created migration: `20251123095432_make_tournament_clubid_optional`
- Admin-hosted tournaments will have `clubId = null`

### 2. New API Endpoints

#### GET /api/tournaments
Get all tournaments in the system (both club-hosted and admin-hosted).

**Response:**
```json
[
  {
    "id": 1,
    "clubId": null,
    "name": "Summer Championship",
    "description": "Annual summer tournament",
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-08-31T00:00:00.000Z",
    "pointsPerWin": 3,
    "pointsPerDraw": 1,
    "pointsPerLoss": 0,
    "pointsPerGoalScored": 1,
    "pointsPerGoalConceded": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "club": null,
    "_count": {
      "participants": 10,
      "matches": 5
    }
  }
]
```

#### POST /api/tournaments
Create a new admin-hosted tournament.

**Request Body:**
```json
{
  "name": "Winter Cup",
  "description": "Winter tournament",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "pointsPerWin": 3,
  "pointsPerDraw": 1,
  "pointsPerLoss": 0,
  "pointsPerGoalScored": 1,
  "pointsPerGoalConceded": 0
}
```

**Response:** (201 Created)
```json
{
  "id": 2,
  "clubId": null,
  "name": "Winter Cup",
  "description": "Winter tournament",
  "startDate": "2024-12-01T00:00:00.000Z",
  "endDate": "2024-12-31T00:00:00.000Z",
  "pointsPerWin": 3,
  "pointsPerDraw": 1,
  "pointsPerLoss": 0,
  "pointsPerGoalScored": 1,
  "pointsPerGoalConceded": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "_count": {
    "participants": 0,
    "matches": 0
  }
}
```

#### GET /api/players
Get all players from all clubs (for participant selection).

**Response:**
```json
[
  {
    "id": 1,
    "clubId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "place": "New York",
    "dateOfBirth": "1995-05-15T00:00:00.000Z",
    "photo": "https://example.com/photo.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "club": {
      "id": 1,
      "name": "Club A",
      "logo": "https://example.com/logo.png"
    }
  }
]
```

### 3. Updated Existing Endpoints

#### GET /api/tournaments/[id]
Now includes club information in participant details for cross-club tournaments.

**Response includes:**
```json
{
  "participants": [
    {
      "player": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "photo": "...",
        "club": {
          "id": 1,
          "name": "Club A"
        }
      }
    }
  ]
}
```

#### GET /api/tournaments/[id]/participants
Now includes club information for each participant.

#### POST /api/tournaments/[id]/participants
Updated to allow adding players from any club (not just the tournament's club).

### 4. Backward Compatibility

All existing club-based tournament endpoints remain functional:
- `GET /api/clubs/[id]/tournaments` - Get tournaments for a specific club
- `POST /api/clubs/[id]/tournaments` - Create a club-hosted tournament

## Usage Examples

### Creating an Admin-Hosted Tournament

```javascript
const response = await fetch('/api/tournaments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Summer Championship 2024',
    description: 'Annual summer tournament',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    pointsPerWin: 3,
    pointsPerDraw: 1,
    pointsPerLoss: 0,
    pointsPerGoalScored: 1,
    pointsPerGoalConceded: 0,
  }),
});

const tournament = await response.json();
console.log(tournament.clubId); // null (admin-hosted)
```

### Adding Participants from Multiple Clubs

```javascript
// Get all players
const playersResponse = await fetch('/api/players');
const allPlayers = await playersResponse.json();

// Select players from different clubs
const selectedPlayerIds = [1, 5, 10, 15]; // Players from various clubs

// Add participants
const response = await fetch(`/api/tournaments/${tournamentId}/participants`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    playerIds: selectedPlayerIds,
  }),
});
```

## Testing

To test the API endpoints manually:

1. **Create an admin-hosted tournament:**
   ```bash
   curl -X POST http://localhost:3000/api/tournaments \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Tournament",
       "startDate": "2024-06-01",
       "pointsPerWin": 3,
       "pointsPerDraw": 1,
       "pointsPerLoss": 0,
       "pointsPerGoalScored": 0,
       "pointsPerGoalConceded": 0
     }'
   ```

2. **Get all tournaments:**
   ```bash
   curl http://localhost:3000/api/tournaments
   ```

3. **Get all players:**
   ```bash
   curl http://localhost:3000/api/players
   ```

4. **Add participants:**
   ```bash
   curl -X POST http://localhost:3000/api/tournaments/1/participants \
     -H "Content-Type: application/json" \
     -d '{"playerIds": [1, 2, 3]}'
   ```

## Migration Notes

- The migration makes `clubId` nullable, so existing tournaments will retain their club associations
- New admin-hosted tournaments will have `clubId = null`
- All existing functionality remains unchanged
- The API now supports both club-hosted and admin-hosted tournaments seamlessly
