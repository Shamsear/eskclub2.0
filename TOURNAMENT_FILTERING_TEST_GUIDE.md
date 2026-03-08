# Tournament Filtering - Manual Test Guide

## Overview
This guide provides manual testing steps to verify the tournament filtering functionality (Task 22).

## Prerequisites
- Have at least 3-5 tournaments created with different dates and statuses:
  - Past tournaments (completed)
  - Current tournaments (ongoing)
  - Future tournaments (upcoming)

## Test Cases

### 1. Status Filter - All (Default)
**Steps:**
1. Navigate to `/dashboard/tournaments`
2. Verify the "All" button is highlighted (blue background)
3. Verify all tournaments are displayed

**Expected Result:**
- All tournaments should be visible
- "All" button should have blue background

### 2. Status Filter - Upcoming
**Steps:**
1. Click the "Upcoming" button
2. Observe the tournament list

**Expected Result:**
- Only tournaments with start dates in the future should be displayed
- "Upcoming" button should be highlighted
- If no upcoming tournaments exist, "No tournaments found" message should appear

### 3. Status Filter - Ongoing
**Steps:**
1. Click the "Ongoing" button
2. Observe the tournament list

**Expected Result:**
- Only tournaments that have started but not ended should be displayed
- "Ongoing" button should be highlighted
- If no ongoing tournaments exist, "No tournaments found" message should appear

### 4. Status Filter - Completed
**Steps:**
1. Click the "Completed" button
2. Observe the tournament list

**Expected Result:**
- Only tournaments with end dates in the past should be displayed
- "Completed" button should be highlighted
- If no completed tournaments exist, "No tournaments found" message should appear

### 5. Date Range Filter - Start Date
**Steps:**
1. Reset filters by clicking "All" or "Clear Filters" if visible
2. Select a start date in the first date input
3. Observe the tournament list

**Expected Result:**
- Only tournaments starting on or after the selected date should be displayed
- Tournaments with earlier start dates should be hidden

### 6. Date Range Filter - End Date
**Steps:**
1. Reset filters
2. Select an end date in the second date input
3. Observe the tournament list

**Expected Result:**
- Only tournaments starting on or before the selected date should be displayed
- Tournaments with later start dates should be hidden

### 7. Date Range Filter - Both Dates
**Steps:**
1. Reset filters
2. Select both a start date and end date
3. Observe the tournament list

**Expected Result:**
- Only tournaments starting within the selected date range should be displayed

### 8. Combined Filters - Status + Date Range
**Steps:**
1. Select "Ongoing" status
2. Select a date range
3. Observe the tournament list

**Expected Result:**
- Only ongoing tournaments within the selected date range should be displayed
- Filters should work together (AND logic)

### 9. Clear Filters Button
**Steps:**
1. Apply any combination of filters
2. Verify "Clear Filters" button appears
3. Click "Clear Filters"

**Expected Result:**
- All filters should reset to default (All status, no dates)
- All tournaments should be displayed again
- "Clear Filters" button should disappear

### 10. No Results State
**Steps:**
1. Apply filters that match no tournaments (e.g., future date range with "Completed" status)
2. Observe the display

**Expected Result:**
- "No tournaments found" message should appear
- "Try adjusting your filters to see more results" helper text should be shown
- Search icon should be displayed

### 11. Responsive Design - Mobile
**Steps:**
1. Resize browser to mobile width (< 768px)
2. Test all filter interactions

**Expected Result:**
- Filter controls should stack vertically
- All functionality should work on mobile
- Touch targets should be adequate

### 12. Responsive Design - Tablet
**Steps:**
1. Resize browser to tablet width (768px - 1024px)
2. Test all filter interactions

**Expected Result:**
- Filters should display appropriately for tablet
- All functionality should work

## Verification Checklist

- [ ] All status filters work correctly
- [ ] Date range filters work correctly
- [ ] Combined filters work together
- [ ] Clear filters button appears and works
- [ ] Empty state displays when no results match
- [ ] Filters persist during interaction (don't reset unexpectedly)
- [ ] UI is responsive on all screen sizes
- [ ] Filter buttons have proper visual feedback (hover, active states)
- [ ] Date inputs are accessible and functional

## Notes
- The filtering is done client-side using React's useMemo hook for performance
- Tournament status is determined by comparing start/end dates with current date:
  - Upcoming: start date > now
  - Completed: end date < now
  - Ongoing: started but not ended
