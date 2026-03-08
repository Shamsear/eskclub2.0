# Walkover Dropdown Debug Logs

## Purpose
Added comprehensive debug logging to diagnose walkover dropdown selection issues.

## Debug Logs Added

### 1. Initial State Logging
**Location:** State initialization
**Logs:**
```javascript
console.log('🔍 [MatchResultForm] Initial walkover state:', {
  initialWalkover,
  hasInitialData: !!initialData,
  initialDataWalkover: initialData?.walkoverWinnerId,
});
```

**What it shows:**
- Initial walkover value from props
- Whether initialData exists
- The raw walkoverWinnerId from initialData

### 2. Validation Effect Logging
**Location:** useEffect for walkover validation
**Logs:**
```javascript
console.log('🔍 [Walkover Validation] Checking walkover validity:', {
  walkoverWinnerId,
  playerResults: playerResults.map(r => ({ playerId: r.playerId })),
});

console.log('🔍 [Walkover Validation] Is valid?', isValidWalkover);

console.log('⚠️ [Walkover Validation] Resetting invalid walkover selection');
```

**What it shows:**
- Current walkover selection
- Current player IDs in the match
- Whether the walkover is valid
- When automatic reset occurs

### 3. Dropdown Render State Logging
**Location:** Before select element renders
**Logs:**
```javascript
console.log('🔍 [Walkover Dropdown] Render state:', {
  walkoverWinnerId,
  displayValue: walkoverWinnerId === null ? '' : walkoverWinnerId.toString(),
  isDisabled: playerResults.filter(r => r.playerId > 0).length < 2,
  selectedPlayersCount: playerResults.filter(r => r.playerId > 0).length,
  playerResults: playerResults.map(r => ({ playerId: r.playerId })),
});
```

**What it shows:**
- Current walkover state
- The value being displayed in the dropdown
- Whether the dropdown is disabled
- How many players are selected
- All player IDs in the match

### 4. Option Rendering Logging
**Location:** When rendering each dropdown option
**Logs:**
```javascript
console.log('🔍 [Walkover Dropdown] Rendering option:', {
  playerId: result.playerId,
  playerName,
  index,
});
```

**What it shows:**
- Each player option being rendered
- Player ID and name for each option
- Array index of each option

### 5. onChange Handler Logging
**Location:** When dropdown value changes
**Logs:**
```javascript
console.log('🔍 [Walkover Dropdown] onChange triggered:', {
  rawValue: value,
  currentWalkover: walkoverWinnerId,
  playerResults: playerResults.map(r => ({ playerId: r.playerId })),
});

console.log('✅ [Walkover Dropdown] Setting to null (normal match)');
console.log('✅ [Walkover Dropdown] Setting to 0 (both forfeited)');
console.log('✅ [Walkover Dropdown] Setting to player ID:', parsedValue);
```

**What it shows:**
- Raw value from the dropdown
- Current walkover state before change
- Current player IDs
- What value is being set

## How to Use These Logs

### 1. Open Browser Console
- Press F12 or right-click → Inspect
- Go to Console tab

### 2. Filter Logs
Search for:
- `[MatchResultForm]` - Initial state
- `[Walkover Validation]` - Validation checks
- `[Walkover Dropdown]` - Dropdown interactions

### 3. Common Scenarios to Check

#### Creating a New Match
Expected log sequence:
1. `[MatchResultForm] Initial walkover state` - Should show `null`
2. `[Walkover Dropdown] Render state` - Should show `isDisabled: true`
3. After selecting players: `isDisabled: false`
4. `[Walkover Dropdown] Rendering option` - Shows available players
5. After selection: `[Walkover Dropdown] onChange triggered`

#### Editing an Existing Match
Expected log sequence:
1. `[MatchResultForm] Initial walkover state` - Should show saved value
2. `[Walkover Validation] Checking walkover validity` - Validates saved value
3. `[Walkover Dropdown] Render state` - Shows current selection
4. `[Walkover Dropdown] Rendering option` - Shows player options

#### Changing Players
Expected log sequence:
1. `[Walkover Validation] Checking walkover validity` - Runs when player changes
2. If invalid: `[Walkover Validation] Resetting invalid walkover selection`
3. `[Walkover Dropdown] Render state` - Shows updated state

### 4. Troubleshooting Guide

**Problem: Dropdown shows wrong value**
- Check `[Walkover Dropdown] Render state` → `displayValue`
- Compare with `walkoverWinnerId`
- Check if value exists in rendered options

**Problem: Can't select option**
- Check `[Walkover Dropdown] Render state` → `isDisabled`
- Check `selectedPlayersCount` (should be >= 2)
- Verify `[Walkover Dropdown] Rendering option` shows options

**Problem: Selection resets unexpectedly**
- Look for `[Walkover Validation] Resetting invalid walkover selection`
- Check if selected player ID exists in `playerResults`

**Problem: Wrong player names**
- Check `[Walkover Dropdown] Rendering option` → `playerName`
- Verify player IDs match participant data

## Removing Debug Logs

Once the issue is diagnosed, remove or comment out the console.log statements:

```bash
# Search for all debug logs
grep -n "console.log.*Walkover" components/MatchResultForm.tsx

# Or use your IDE's find feature to search for:
console.log('🔍 [Walkover
console.log('✅ [Walkover
console.log('⚠️ [Walkover
```

## Log Symbols
- 🔍 - Information/inspection
- ✅ - Success/action taken
- ⚠️ - Warning/automatic correction

## Files Modified
- `components/MatchResultForm.tsx` - Added debug logging throughout walkover logic
