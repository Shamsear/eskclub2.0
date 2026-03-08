# Tournament API Reference

## Base URLs
- Club Tournaments: `/api/clubs/[clubId]/tournaments`
- Tournaments: `/api/tournaments/[id]`
- Leaderboard: `/api/tournaments/[id]/leaderboard`

## Endpoints

### 1. Get All Tournaments for a Club
```
GET /api/clubs/[clubId]/tournaments
```

**Authentication**: Required

**Response**: 200 OK
```json
[
  {
    "id": 1,
    "clubId": 1,
    "name": "Summer Championship 2024",
    "description": "Annual summer tournament",
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-08-31T00:00:00.000Z",
    "pointsPerWin": 3,
    "pointsPerDraw": 1,
    "pointsPerLoss": 0,
    "pointsPerGoalScored": 1,
    "pointsPerGoalConceded": 0,
    "createdAt": "2024-05-01T00:00:00.000Z",
    "updatedAt": "2024-05-01T00:00:00.000Z",
    "_count": {
      "participants": 20,
      "matches": 15
    }
  }
]
```

**Errors**:
- 401: Unauthorized (not authenticated)
- 404: Club not found
- 400: Invalid club ID

---

### 2. Create Tournament
```
POST /api/clubs/[clubId]/tournaments
```

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Summer Championship 2024",
  "description": "Annual summer tournament",
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "pointsPerWin": 3,
  "pointsPerDraw": 1,
  "pointsPerLoss": 0,
  "pointsPerGoalScored": 1,
  "pointsPerGoalConceded": 0
}
```

**Validation Rules**:
- `name`: Required, 1-100 characters
- `description`: Optional
- `startDate`: Required, valid date format
- `endDate`: Optional, must be >= startDate
- `pointsPerWin`: Default 3, must be >= 0
- `pointsPerDraw`: Default 1, must be >= 0
- `pointsPerLoss`: Default 0, must be >= 0
- `pointsPerGoalScored`: Default 0, must be >= 0
- `pointsPerGoalConceded`: Default 0, must be >= 0

**Response**: 201 Created
```json
{
  "id": 1,
  "clubId": 1,
  "name": "Summer Championship 2024",
  "description": "Annual summer tournament",
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T00:00:00.000Z",
  "pointsPerWin": 3,
  "pointsPerDraw": 1,
  "pointsPerLoss": 0,
  "pointsPerGoalScored": 1,
  "pointsPerGoalConceded": 0,
  "createdAt": "2024-05-01T00:00:00.000Z",
  "updatedAt": "2024-05-01T00:00:00.000Z",
  "_count": {
    "participants": 0,
    "matches": 0
  }
}
```

**Errors**:
- 401: Unauthorized
- 404: Club not found
- 400: Validation error

---

### 3. Get Tournament Details
```
GET /api/tournaments/[id]
```

**Authentication**: Required

**Response**: 200 OK
```json
{
  "id": 1,
  "clubId": 1,
  "name": "Summer Championship 2024",
  "description": "Annual summer tournament",
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T00:00:00.000Z",
  "pointsPerWin": 3,
  "pointsPerDraw": 1,
  "pointsPerLoss": 0,
  "pointsPerGoalScored": 1,
  "pointsPerGoalConceded": 0,
  "createdAt": "2024-05-01T00:00:00.000Z",
  "updatedAt": "2024-05-01T00:00:00.000Z",
  "club": {
    "id": 1,
    "name": "FC Barcelona",
    "logo": "https://example.com/logo.png"
  },
  "participants": [
    {
      "id": 1,
      "tournamentId": 1,
      "playerId": 10,
      "createdAt": "2024-05-01T00:00:00.000Z",
      "player": {
        "id": 10,
        "name": "John Doe",
        "email": "john@example.com",
        "photo": "https://example.com/photo.jpg"
      }
    }
  ],
  "matches": [
    {
      "id": 1,
      "tournamentId": 1,
      "matchDate": "2024-06-15T00:00:00.000Z",
      "createdAt": "2024-06-15T00:00:00.000Z",
      "updatedAt": "2024-06-15T00:00:00.000Z",
      "results": [
        {
          "id": 1,
          "matchId": 1,
          "playerId": 10,
          "outcome": "WIN",
          "goalsScored": 3,
          "goalsConceded": 1,
          "pointsEarned": 6,
          "player": {
            "id": 10,
            "name": "John Doe"
          }
        }
      ]
    }
  ],
  "_count": {
    "participants": 20,
    "matches": 15
  }
}
```

**Errors**:
- 401: Unauthorized
- 404: Tournament not found
- 400: Invalid tournament ID

---

### 4. Update Tournament
```
PUT /api/tournaments/[id]
```

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "name": "Updated Tournament Name",
  "description": "Updated description",
  "startDate": "2024-06-01",
  "endDate": "2024-09-30",
  "pointsPerWin": 5,
  "pointsPerDraw": 2,
  "pointsPerLoss": 0,
  "pointsPerGoalScored": 2,
  "pointsPerGoalConceded": -1
}
```

**Response**: 200 OK
```json
{
  "id": 1,
  "clubId": 1,
  "name": "Updated Tournament Name",
  "description": "Updated description",
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-09-30T00:00:00.000Z",
  "pointsPerWin": 5,
  "pointsPerDraw": 2,
  "pointsPerLoss": 0,
  "pointsPerGoalScored": 2,
  "pointsPerGoalConceded": -1,
  "createdAt": "2024-05-01T00:00:00.000Z",
  "updatedAt": "2024-11-22T00:00:00.000Z",
  "club": {
    "id": 1,
    "name": "FC Barcelona"
  },
  "_count": {
    "participants": 20,
    "matches": 15
  }
}
```

**Errors**:
- 401: Unauthorized
- 404: Tournament not found
- 400: Validation error

---

### 5. Delete Tournament
```
DELETE /api/tournaments/[id]
```

**Authentication**: Required

**Response**: 200 OK
```json
{
  "message": "Tournament deleted successfully",
  "deletedParticipants": 20,
  "deletedMatches": 15
}
```

**Note**: Cascade deletes all related data:
- Tournament participants
- Matches
- Match results
- Player statistics

**Errors**:
- 401: Unauthorized
- 404: Tournament not found
- 400: Invalid tournament ID

---

### 6. Get Tournament Leaderboard
```
GET /api/tournaments/[id]/leaderboard
```

**Authentication**: Required

**Response**: 200 OK
```json
{
  "tournament": {
    "id": 1,
    "name": "Summer Championship 2024",
    "pointSystem": {
      "pointsPerWin": 3,
      "pointsPerDraw": 1,
      "pointsPerLoss": 0,
      "pointsPerGoalScored": 1,
      "pointsPerGoalConceded": 0
    }
  },
  "leaderboard": [
    {
      "rank": 1,
      "player": {
        "id": 10,
        "name": "John Doe",
        "email": "john@example.com",
        "photo": "https://example.com/photo.jpg"
      },
      "stats": {
        "matchesPlayed": 10,
        "wins": 7,
        "draws": 2,
        "losses": 1,
        "goalsScored": 25,
        "goalsConceded": 8,
        "totalPoints": 48
      },
      "updatedAt": "2024-08-30T00:00:00.000Z"
    },
    {
      "rank": 2,
      "player": {
        "id": 11,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "photo": "https://example.com/photo2.jpg"
      },
      "stats": {
        "matchesPlayed": 10,
        "wins": 6,
        "draws": 3,
        "losses": 1,
        "goalsScored": 22,
        "goalsConceded": 10,
        "totalPoints": 43
      },
      "updatedAt": "2024-08-30T00:00:00.000Z"
    }
  ]
}
```

**Sorting**: Leaderboard is sorted by:
1. Total points (descending)
2. Goals scored (descending)
3. Wins (descending)

**Errors**:
- 401: Unauthorized
- 404: Tournament not found
- 400: Invalid tournament ID

---

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "name": "Name is required",
    "endDate": "End date must be after or equal to start date"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Tournament not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred"
}
```

---

## Custom Point System

The tournament point system allows flexible scoring rules:

- **pointsPerWin**: Points awarded for winning a match (default: 3)
- **pointsPerDraw**: Points awarded for drawing a match (default: 1)
- **pointsPerLoss**: Points awarded for losing a match (default: 0)
- **pointsPerGoalScored**: Points per goal scored (default: 0)
- **pointsPerGoalConceded**: Points per goal conceded (default: 0, can be negative)

**Example Calculation**:
```
Player wins a match: 3-1
- Win points: 3
- Goals scored: 3 × 1 = 3
- Goals conceded: 1 × 0 = 0
- Total: 6 points
```

---

## Next.js 15 Async Params

All routes use Next.js 15's async params pattern:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... route logic
}
```

This is a breaking change from Next.js 14 where params were synchronous.
