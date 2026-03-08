# Match Stage Selection Implementation

## Overview
Implemented stage-based point calculation for matches, allowing tournaments to assign different point values based on the stage of the tournament (e.g., League, Knockout, Group Stage).

## Changes Made

### 1. Database Schema Updates
**File:** `prisma/schema.prisma`

Added stage reference fields to the Match model:
- `stageId` (optional): References the StagePoint ID
- `stageName` (optional): Stores the stage name for display
- Added relation to `StagePoint` model
- Added `matches` relation back to `StagePoint`

**Migration Required:**
```bash
npx prisma migrate dev --name add_match_stages
npx prisma generate
```

### 2. Validation Schema Updates
**File:** `lib/validations/match.ts`

Updated both `matchCreateSchema` and `matchUpdateSchema` to include:
- `stageId` (optional number)
- `stageName` (optional string)

### 3. API Endpoints

#### Tournament Stages Endpoint
**File:** `app/api/tournaments/[id]/stages/route.ts`

- Fixed field names to match current schema
- Returns list of stages with their point configurations
- Used by the match form to populate stage dropdown

#### Match Creation API
**File:** `app/api/tournaments/[id]/matches/route.ts`

Enhanced point calculation logic:
1. If `stageId` is provided, fetch stage-specific points from `StagePoint` table
2. If stage points exist, use them for calculation
3. Otherwise, fall back to template or inline tournament points
4. Store `stageId` and `stageName` with the match

#### Match Update API
**File:** `app/api/matches/[id]/route.ts`

Similar enhancements:
1. Check for updated `stageId` or use existing match's `stageId`
2. Fetch stage-specific points if available
3. Fall back to template or inline points
4. Allow updating `stageId` and `stageName`

### 4. Frontend Components

#### MatchResultForm
**File:** `components/MatchResultForm.tsx`

Already implemented:
- State management for stages and selected stage
- Fetches available stages from `/api/tournaments/[id]/stages`
- Displays stage selector dropdown (optional field)
- Includes stage data in form submission
- Shows "No specific stage (use default points)" option

## How It Works

### Point Calculation Priority
1. **Stage-specific points** (highest priority)
   - If match has `stageId` and tournament uses a point system template
   - Fetches points from `StagePoint` table for that specific stage

2. **Template points** (medium priority)
   - If tournament uses a point system template but no stage selected
   - Uses template's default points and conditional rules

3. **Inline points** (lowest priority/fallback)
   - If tournament doesn't use a template
   - Uses points defined directly on the tournament

### User Flow
1. User creates/edits a match
2. Form displays available stages (if tournament has a point system with stages)
3. User optionally selects a stage
4. On submission:
   - Match is created/updated with stage reference
   - Points are calculated using stage-specific values
   - Match results are stored with calculated points

## Benefits
- **Flexible scoring**: Different stages can have different point values
- **Accurate representation**: Matches are tagged with their tournament stage
- **Backward compatible**: Works with existing tournaments without stages
- **Optional feature**: Stages are optional, default points still work

## Testing Checklist
- [ ] Create a point system with multiple stages
- [ ] Create a tournament using that point system
- [ ] Add a match without selecting a stage (should use default points)
- [ ] Add a match with a specific stage (should use stage points)
- [ ] Verify points are calculated correctly for each scenario
- [ ] Edit a match and change its stage
- [ ] Verify statistics update correctly

## Future Enhancements
- Display stage name on match cards/lists
- Filter matches by stage
- Stage-specific leaderboards
- Automatic stage progression based on match results
