# Form Field ID and Name Attributes Fix

## Problem
Browser console warning: "A form field element has neither an id nor a name attribute. This might prevent the browser from correctly autofilling the form."

This warning appears when form input elements don't have proper identification attributes, which can:
- Prevent browser autofill from working correctly
- Reduce accessibility
- Make form data harder to process
- Cause issues with form validation

## Root Cause
Several form input elements in the MatchResultForm component were missing `id` and `name` attributes:
1. Checkbox inputs for point component toggles
2. Number input for extra points
3. Input component not automatically adding `name` attribute

## Solution Implemented

### 1. Updated Input Component
**File:** `components/ui/Input.tsx`

**Changes:**
- Added `name` prop to InputProps interface
- Auto-generate `name` from `id` if not provided
- Pass `name` attribute to the underlying input element

**Before:**
```typescript
<input
  id={inputId}
  className={inputClassName}
  {...props}
/>
```

**After:**
```typescript
const inputName = name || inputId;

<input
  id={inputId}
  name={inputName}
  className={inputClassName}
  {...props}
/>
```

**Benefits:**
- All Input components now have both `id` and `name` attributes
- Maintains backward compatibility
- Allows explicit `name` override when needed

### 2. Added IDs to Checkbox Inputs
**File:** `components/MatchResultForm.tsx`

**Fixed checkboxes:**

#### Outcome Points Checkbox
```typescript
<input
  type="checkbox"
  id={`outcome-points-${index}`}
  name={`outcome-points-${index}`}
  checked={pointOverrides[index].components.outcomePoints.enabled}
  ...
/>
```

#### Goal Scored Points Checkbox
```typescript
<input
  type="checkbox"
  id={`goal-scored-points-${index}`}
  name={`goal-scored-points-${index}`}
  checked={pointOverrides[index].components.goalScoredPoints.enabled}
  ...
/>
```

#### Goal Conceded Points Checkbox
```typescript
<input
  type="checkbox"
  id={`goal-conceded-points-${index}`}
  name={`goal-conceded-points-${index}`}
  checked={pointOverrides[index].components.goalConcededPoints.enabled}
  ...
/>
```

### 3. Added IDs to Number Inputs

#### Extra Points Input
```typescript
<input
  type="number"
  id={`extra-points-${index}`}
  name={`extra-points-${index}`}
  value={pointOverrides[index].extraPoints === 0 ? '' : pointOverrides[index].extraPoints}
  ...
/>
```

#### Goals Scored Input (via Input component)
```typescript
<Input
  label="Goals Scored"
  type="number"
  id={`goals-scored-${index}`}
  name={`goals-scored-${index}`}
  ...
/>
```

## Benefits

### 1. Browser Autofill
- Browsers can now properly identify and autofill form fields
- Improves user experience with saved form data

### 2. Accessibility
- Screen readers can better identify form fields
- Improves navigation for keyboard users
- Better form field labeling

### 3. Form Processing
- Easier to identify fields in form submission
- Better error handling and validation
- Clearer form data structure

### 4. Developer Experience
- Easier to debug form issues
- Better testability with unique identifiers
- Clearer code intent

## Naming Convention

All dynamic form fields use a consistent naming pattern:
```
{field-purpose}-{index}
```

Examples:
- `outcome-points-0`, `outcome-points-1`
- `goal-scored-points-0`, `goal-scored-points-1`
- `extra-points-0`, `extra-points-1`
- `goals-scored-0`, `goals-scored-1`

This ensures:
- Unique IDs for each field
- Clear identification of field purpose
- Easy to generate and maintain

## Testing

To verify the fix:
1. Open browser DevTools Console
2. Navigate to a form page
3. Check that the warning no longer appears
4. Inspect form elements to verify `id` and `name` attributes exist
5. Test browser autofill functionality

## Files Modified
1. `components/ui/Input.tsx` - Added automatic `name` attribute generation
2. `components/MatchResultForm.tsx` - Added `id` and `name` to all raw input elements

## Impact
- No breaking changes
- All existing forms continue to work
- Improved accessibility and user experience
- Resolved browser console warnings
