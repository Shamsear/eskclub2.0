# Custom Points Override Feature

## Overview
The custom points override feature allows administrators to manually adjust points for individual players in a match, overriding the automatic point calculation system.

## Use Cases
- **Special Circumstances**: Award bonus points for exceptional performance
- **Penalties**: Deduct points for rule violations or unsportsmanlike conduct
- **Corrections**: Fix point calculation errors without changing the point system
- **Custom Scenarios**: Handle unique situations not covered by the standard point system

## How It Works

### UI Components
1. **Point Calculation Display**: Shows the automatically calculated points based on the point system
2. **Override Button**: Toggles between automatic and custom point calculation
3. **Custom Points Input**: Allows manual entry of points when override is enabled

### User Flow
1. Fill in match details (players, date, scores)
2. View the automatically calculated points for each player
3. Click "Override" button to enable custom points
4. Enter the desired custom points value
5. Click "Use Auto" to revert to automatic calculation
6. Submit the match

### Point Calculation Priority
1. **Custom Points** (if override enabled) - Highest priority
2. **Walkover Points** (if walkover selected)
3. **Automatic Calculation** (based on point system)

## Technical Implementation

### Frontend (MatchResultForm.tsx)
- Added `pointOverrides` state to track custom points per player
- Added `showPointOverride` toggle for expandable section
- Modified submit handler to include `customPoints` in payload

### Validation (lib/validations/match.ts)
- Added optional `customPoints` field to `matchResultSchema`
- Accepts any integer value (positive, negative, or zero)

### API (app/api/tournaments/[id]/matches/route.ts)
- Checks for `customPoints` in result data
- If present, uses custom points directly
- Otherwise, calculates points normally
- Custom points override even walkover points

## Example Usage

### Normal Match with Custom Points
```json
{
  "matchDate": "2024-12-04",
  "results": [
    {
      "playerId": 1,
      "outcome": "WIN",
      "goalsScored": 3,
      "goalsConceded": 1,
      "customPoints": 10  // Override: normally would be 5 points
    },
    {
      "playerId": 2,
      "outcome": "LOSS",
      "goalsScored": 1,
      "goalsConceded": 3,
      "customPoints": -2  // Penalty: normally would be 0 points
    }
  ]
}
```

### Walkover with Custom Points
```json
{
  "matchDate": "2024-12-04",
  "walkoverWinnerId": 1,
  "results": [
    {
      "playerId": 1,
      "outcome": "WIN",
      "goalsScored": 0,
      "goalsConceded": 0,
      "customPoints": 5  // Override walkover win points (normally 3)
    },
    {
      "playerId": 2,
      "outcome": "LOSS",
      "goalsScored": 0,
      "goalsConceded": 0
      // No custom points - uses walkover loss points (-3)
    }
  ]
}
```

## UI Features

### Visual Indicators
- **Blue badge**: Shows "Custom Points" when override is active
- **Purple badge**: Shows "Calculated Points" for automatic calculation
- **Toggle button**: "Override" / "Use Auto" to switch modes
- **Breakdown**: Shows point calculation details when using automatic mode

### Accessibility
- Clear labels and helper text
- Visual feedback for override state
- Easy toggle between modes
- Preserves calculated value when switching

## Benefits
1. **Flexibility**: Handle edge cases without modifying the point system
2. **Transparency**: Shows both calculated and custom points
3. **Reversible**: Easy to switch back to automatic calculation
4. **Audit Trail**: Custom points are stored separately in the database
5. **Per-Player**: Each player can have different override settings

## Future Enhancements
- Add reason/note field for custom points
- Show history of point adjustments
- Bulk point override for multiple matches
- Admin approval workflow for custom points
