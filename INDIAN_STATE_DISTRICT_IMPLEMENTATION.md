# Indian State and District Selection Implementation

## Changes Made

### 1. Created State-District Data (`lib/data/indian-states-districts.ts`)
- Complete list of all Indian states and union territories
- Districts for each state (auto-populated based on state selection)
- Exported constants: `INDIAN_STATES` and `INDIAN_STATES_DISTRICTS`

### 2. Created Select Component (`components/ui/Select.tsx`)
- Reusable dropdown component
- Consistent styling with Input component
- Support for labels, errors, and helper text
- Accessible with ARIA attributes

### 3. Updated Member Form (`components/ManagerForm.tsx`)

**Before:**
- Single text input for "Place" (free text: "City, Country")

**After:**
- State dropdown (all Indian states)
- District dropdown (auto-populated based on selected state)
- District is disabled until state is selected
- Data is stored in database as "District, State" format

### Features

✅ **State Selection**: Dropdown with all 28 states and 8 union territories
✅ **Auto-populated Districts**: Districts update automatically when state changes
✅ **Validation**: District resets if state changes
✅ **Disabled State**: District dropdown is disabled until state is selected
✅ **Data Format**: Stored as "District, State" (e.g., "Bengaluru Urban, Karnataka")
✅ **Backward Compatible**: Existing data is parsed correctly on edit

### Usage Flow

1. User selects a state from dropdown
2. District dropdown automatically populates with districts for that state
3. User selects a district
4. Data is saved as "District, State" in the database
5. On edit, the form automatically parses and populates both fields

### Example States Included

- All major states: Karnataka, Maharashtra, Tamil Nadu, Kerala, etc.
- Union territories: Delhi, Puducherry, Chandigarh, etc.
- Complete district lists for each state

### Database Storage

The `place` field in the database stores the combined value:
- Format: `"District, State"`
- Example: `"Bengaluru Urban, Karnataka"`
- Example: `"Mumbai City, Maharashtra"`
- Example: `"Central Delhi, Delhi"`
