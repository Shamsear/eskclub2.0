# CSV Bulk Match Upload - Debugging Improvements

## Problem
Users were seeing matches marked as "skipped" without clear indication of why they failed to upload.

## Root Cause
Matches are skipped when:
1. **Player names don't match exactly** - The API does case-insensitive comparison but requires exact name matches
2. **Players not found in tournament** - Names in CSV that aren't registered participants
3. **Validation errors** - Missing required fields, invalid dates, negative goals, etc.

## Improvements Made

### 1. Enhanced Preview Table
- Added **Row Number** column to track CSV line numbers
- Added **Status** column showing validation state with icons
- Invalid rows are highlighted with red background
- Validation errors displayed inline for each problematic match
- Player names in invalid rows shown in red

### 2. Better Error Display
- Shows count of invalid matches at the top of preview
- Upload button disabled when validation errors exist
- Detailed error messages shown for each invalid row
- Errors persist after upload attempt so users can fix issues

### 3. Available Participants List
- Shows all valid participant names in a visual list
- Helps users verify exact spelling before uploading
- Displayed prominently in the instructions section

### 4. Improved Upload Response Handling
- API errors now displayed in the errors section
- Page doesn't redirect if there were skipped matches
- Toast messages differentiate between success, partial success, and failure
- Users can see exactly which matches failed and why

### 5. Pre-Upload Validation
- Client-side validation checks:
  - Player names exist in participants list
  - Both players are different
  - Required fields are present
  - Date format is correct (YYYY-MM-DD)
  - Goals are non-negative
  - Walkover values are valid
- Prevents invalid data from being sent to server

## How to Use

1. **Download the template** - Contains actual participant names
2. **Fill in match data** - Use exact names from the participants list
3. **Upload CSV** - Preview shows validation status for each match
4. **Fix errors** - Red rows show what needs to be corrected
5. **Re-upload** - Only valid matches will be uploaded

## Example Error Messages

- `Player A "John Doe" not found in tournament participants`
- `Players must be different`
- `Date must be in YYYY-MM-DD format`
- `Both player names are required`

## Technical Details

### Frontend Validation
```typescript
const validateMatch = (match: ParsedMatch) => {
  // Checks player existence
  const playerAExists = participants.some(
    p => p.name.toLowerCase() === match.playerAName.toLowerCase()
  );
  // Returns validation errors array
}
```

### Backend Matching
```typescript
const playerA = tournament.participants.find(
  p => p.player.name.toLowerCase() === match.playerAName.toLowerCase()
);
```

## Files Modified
- `components/BulkMatchUpload.tsx` - Enhanced preview table, validation display, and error handling
