# Public API Reference

This document describes the public-facing API endpoints that power the immersive sports platform experience. These endpoints are **unauthenticated** and optimized for public consumption.

## Base URL

All endpoints are prefixed with `/api/public`

## Endpoints

### Tournaments

#### GET /api/public/tournaments

Get a paginated list of tournaments with optional status filtering.

**Query Parameters:**
- `status` (optional): Filter by tournament status
  - `upcoming`: Tournaments that haven't started yet
  - `active`: Tournaments currently in progress
  - `completed`: Tournaments that have ended
- `page` (optional, default: 1): Page number for pagination
- `pageSize` (optional, default: 20): Number of items per page

**Response:**
```json
{
  "tournaments": [
    {
      "id": 1,
      "name": "Summer Championship 2024",
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T00:00:00.000Z",
      "participantCount": 24,
      "matchCount": 48,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45
  }
}
```

#### GET /api/public/tournaments/[id]

Get detailed information about a specific tournament.

**Response:**
```json
{
  "tournament": {
    "id": 1,
    "name": "Summer Championship 2024",
    "description": "Annual summer tournament featuring top clubs",
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-08-31T00:00:00.000Z",
    "club": {
      "id": 5,
      "name": "Elite Sports Club",
      "logo": "https://example.com/logo.png"
    },
    "pointSystem": {
      "pointsPerWin": 3,
      "pointsPerDraw": 1,
      "pointsPerLoss": 0,
      "pointsPerGoalScored": 0,
      "pointsPerGoalConceded": 0
    }
  },
  "stages": [
    {
      "id": 1,
      "name": "Group Stage",
      "order": 1,
      "matchCount": 24
    },
    {
      "id": 2,
      "name": "Knockout Round",
      "order": 2,
      "matchCount": 8
    }
  ],
  "stats": {
    "totalMatches": 48,
    "completedMatches": 32,
    "totalGoals": 156,
    "participantCount": 24
  }
}
```

#### GET /api/public/tournaments/[id]/leaderboard

Get the current leaderboard for a tournament with player rankings.

**Response:**
```json
{
  "tournament": {
    "id": 1,
    "name": "Summer Championship 2024"
  },
  "rankings": [
    {
      "rank": 1,
      "player": {
        "id": 42,
        "name": "John Smith",
        "photo": "https://example.com/photo.jpg",
        "club": {
          "id": 5,
          "name": "Elite Sports Club",
          "logo": "https://example.com/logo.png"
        }
      },
      "stats": {
        "matchesPlayed": 12,
        "wins": 9,
        "draws": 2,
        "losses": 1,
        "goalsScored": 24,
        "goalsConceded": 8,
        "goalDifference": 16,
        "totalPoints": 29
      }
    }
  ]
}
```

### Matches

#### GET /api/public/matches/[id]

Get detailed information about a specific match including results.

**Response:**
```json
{
  "match": {
    "id": 123,
    "date": "2024-07-15T18:00:00.000Z",
    "stageName": "Group Stage",
    "tournament": {
      "id": 1,
      "name": "Summer Championship 2024"
    }
  },
  "results": [
    {
      "player": {
        "id": 42,
        "name": "John Smith",
        "photo": "https://example.com/photo.jpg",
        "club": {
          "id": 5,
          "name": "Elite Sports Club",
          "logo": "https://example.com/logo.png"
        }
      },
      "outcome": "WIN",
      "goalsScored": 3,
      "goalsConceded": 1,
      "pointsEarned": 3,
      "basePoints": 3,
      "conditionalPoints": 0
    }
  ]
}
```

### Players

#### GET /api/public/players/[id]

Get comprehensive player profile with statistics and history.

**Response:**
```json
{
  "player": {
    "id": 42,
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+1234567890",
    "place": "New York",
    "dateOfBirth": "1995-03-15T00:00:00.000Z",
    "photo": "https://example.com/photo.jpg",
    "club": {
      "id": 5,
      "name": "Elite Sports Club",
      "logo": "https://example.com/logo.png"
    },
    "roles": ["PLAYER", "CAPTAIN"]
  },
  "stats": {
    "totalTournaments": 8,
    "totalMatches": 96,
    "totalWins": 64,
    "totalDraws": 18,
    "totalLosses": 14,
    "totalGoalsScored": 142,
    "totalGoalsConceded": 68,
    "totalPoints": 210,
    "winRate": 66.67
  },
  "recentMatches": [
    {
      "id": 123,
      "date": "2024-07-15T18:00:00.000Z",
      "tournament": {
        "id": 1,
        "name": "Summer Championship 2024"
      },
      "outcome": "WIN",
      "goalsScored": 3,
      "goalsConceded": 1,
      "pointsEarned": 3
    }
  ],
  "tournaments": [
    {
      "id": 1,
      "name": "Summer Championship 2024",
      "startDate": "2024-06-01T00:00:00.000Z",
      "rank": 1,
      "totalPoints": 29
    }
  ]
}
```

### Clubs

#### GET /api/public/clubs

Get a paginated list of clubs with basic information and achievements.

**Query Parameters:**
- `page` (optional, default: 1): Page number for pagination
- `pageSize` (optional, default: 20): Number of items per page

**Response:**
```json
{
  "clubs": [
    {
      "id": 5,
      "name": "Elite Sports Club",
      "logo": "https://example.com/logo.png",
      "description": "Premier sports club established in 2010",
      "playerCount": 45,
      "tournamentCount": 12,
      "achievements": [
        {
          "type": "tournament_win",
          "label": "3 Tournaments Hosted"
        },
        {
          "type": "top_scorer",
          "label": "Top Scorer: 24 Goals"
        },
        {
          "type": "most_active",
          "label": "Active Community"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 15
  }
}
```

#### GET /api/public/clubs/[id]

Get detailed club profile with members, tournaments, and statistics.

**Response:**
```json
{
  "club": {
    "id": 5,
    "name": "Elite Sports Club",
    "logo": "https://example.com/logo.png",
    "description": "Premier sports club established in 2010",
    "createdAt": "2010-01-15T00:00:00.000Z"
  },
  "players": [
    {
      "id": 42,
      "name": "John Smith",
      "photo": "https://example.com/photo.jpg",
      "roles": ["PLAYER", "CAPTAIN"],
      "stats": {
        "totalMatches": 96,
        "totalPoints": 210,
        "winRate": 66.67
      }
    }
  ],
  "tournaments": [
    {
      "id": 1,
      "name": "Summer Championship 2024",
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T00:00:00.000Z",
      "participantCount": 24,
      "status": "active"
    }
  ],
  "stats": {
    "totalPlayers": 45,
    "totalTournaments": 12,
    "totalMatches": 156,
    "totalGoals": 342
  }
}
```

## Data Aggregation

All public API endpoints perform optimized data aggregation to provide rich, pre-calculated statistics:

- **Tournament Stats**: Automatically calculate completed matches, total goals, and participant counts
- **Player Stats**: Aggregate statistics across all tournaments including win rates
- **Club Stats**: Calculate aggregate statistics for all club members
- **Leaderboard Rankings**: Apply tiebreaker rules (points → goal difference → goals scored)

## Performance Considerations

- All endpoints use efficient database queries with proper indexing
- Pagination is implemented for list endpoints to prevent large payloads
- Related data is eagerly loaded to minimize N+1 query problems
- Response data is transformed to match frontend requirements

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "status": 404
}
```

Common status codes:
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Authentication

**Note**: These public API endpoints do NOT require authentication. They are designed for public consumption and display on the public-facing sports platform.
