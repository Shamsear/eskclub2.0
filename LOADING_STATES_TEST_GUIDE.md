# Loading States Testing Guide

## Quick Test Checklist

Use this guide to manually verify all loading states are working correctly.

### Prerequisites
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Enable network throttling: Select "Slow 3G" or "Fast 3G"

### Test Cases

#### 1. Tournament List Page Loading
**URL**: `/dashboard/tournaments`

**Expected Behavior**:
- [ ] Page shows 6 skeleton tournament cards in grid layout
- [ ] Skeleton cards have pulsing animation
- [ ] Header shows skeleton for title and button
- [ ] After loading, real tournament cards appear smoothly

**How to Test**:
1. Navigate to tournaments page with throttling enabled
2. Observe skeleton loaders
3. Wait for data to load
4. Verify smooth transition

---

#### 2. Tournament Details Page Loading
**URL**: `/dashboard/tournaments/[id]`

**Expected Behavior**:
- [ ] Breadcrumb skeleton appears
- [ ] Tournament header skeleton with info grid
- [ ] Point system skeleton with 5 cards
- [ ] Action buttons skeleton (4 buttons)
- [ ] Tabs skeleton
- [ ] Content area skeleton

**How to Test**:
1. Click on any tournament from list
2. Observe comprehensive skeleton structure
3. Verify all sections have appropriate skeletons

---

#### 3. Tournament Creation Form Loading
**URL**: `/dashboard/tournaments/new`

**Expected Behavior**:
- [ ] Form fields skeleton appears
- [ ] Point system section skeleton
- [ ] Action buttons skeleton

**How to Test**:
1. Click "Create Tournament" button
2. Observe form skeleton during page load

---

#### 4. Form Submission Loading States

##### Tournament Form Submission
**Expected Behavior**:
- [ ] Submit button shows spinner icon
- [ ] Submit button text changes (e.g., "Creating Tournament...")
- [ ] Submit button is disabled
- [ ] Cancel button is disabled
- [ ] Form remains visible but disabled

**How to Test**:
1. Fill out tournament creation form
2. Click submit button
3. Observe button loading state
4. Verify form doesn't allow interaction during submission

##### Match Result Form Submission
**Expected Behavior**:
- [ ] Submit button shows spinner
- [ ] Button text changes to "Adding Match Result..." or "Updating..."
- [ ] All buttons disabled during submission
- [ ] Add/Remove player buttons disabled

**How to Test**:
1. Navigate to add match result page
2. Fill out form with player results
3. Click submit
4. Observe loading states

---

#### 5. Delete Operation Loading States

##### Match Deletion
**Expected Behavior**:
- [ ] Delete button shows inline spinner
- [ ] Button text changes to "Deleting..."
- [ ] Button is disabled
- [ ] Other match actions remain accessible
- [ ] Confirmation dialog shows loading state

**How to Test**:
1. Go to tournament matches tab
2. Click delete on any match
3. Confirm deletion in dialog
4. Observe inline loading indicator

##### Participant Removal
**Expected Behavior**:
- [ ] Remove button shows spinner icon
- [ ] Button is disabled
- [ ] Other participants remain interactive
- [ ] Confirmation dialog shows loading state

**How to Test**:
1. Go to tournament participants page
2. Click remove on any participant
3. Confirm removal
4. Observe loading state on specific participant

##### Tournament Deletion
**Expected Behavior**:
- [ ] Confirmation dialog appears
- [ ] Confirm button shows spinner when clicked
- [ ] Cancel button is disabled during deletion
- [ ] Dialog remains open during operation

**How to Test**:
1. Go to tournament details page
2. Click "Delete Tournament" button
3. Confirm deletion
4. Observe dialog loading state

---

#### 6. Participant Addition Loading States

**Expected Behavior**:
- [ ] Modal opens with participant list
- [ ] Submit button shows player count
- [ ] When clicked, button shows spinner
- [ ] Button text changes to "Adding..."
- [ ] Cancel button is disabled
- [ ] Modal remains open during operation

**How to Test**:
1. Go to tournament participants page
2. Click "Add Participants"
3. Select some players
4. Click "Add X Players" button
5. Observe loading state

---

#### 7. Leaderboard Loading State

**Expected Behavior**:
- [ ] Point system skeleton appears
- [ ] Table skeleton for desktop view
- [ ] Card skeleton for mobile view
- [ ] 5 rows/cards of skeleton content

**How to Test**:
1. Navigate to tournament details
2. Click "Leaderboard" tab
3. If data is loading, observe skeleton
4. Verify smooth transition to actual data

---

#### 8. Match List Loading State

**Expected Behavior**:
- [ ] Match card skeletons appear
- [ ] Multiple cards shown
- [ ] Smooth transition to actual matches

**How to Test**:
1. Navigate to tournament details
2. Click "Matches" tab
3. Observe skeleton if loading
4. Verify transition

---

#### 9. Participants Page Loading

**Expected Behavior**:
- [ ] Header skeleton with title and button
- [ ] Participant cards grid skeleton (6 cards)
- [ ] Each card shows avatar, name, email, club skeletons

**How to Test**:
1. Navigate to tournament participants page
2. Observe comprehensive skeleton structure
3. Verify smooth transition

---

#### 10. Match Form Pages Loading

**Expected Behavior**:
- [ ] Form skeleton with all fields
- [ ] Player result cards skeleton
- [ ] Outcome buttons skeleton
- [ ] Goals fields skeleton
- [ ] Action buttons skeleton

**How to Test**:
1. Navigate to add/edit match result page
2. Observe form skeleton
3. Verify all sections have skeletons

---

### Network Throttling Profiles

#### Slow 3G
- Download: 400 Kbps
- Upload: 400 Kbps
- Latency: 2000ms
- **Best for**: Testing skeleton loaders

#### Fast 3G
- Download: 1.6 Mbps
- Upload: 750 Kbps
- Latency: 562.5ms
- **Best for**: Testing button loading states

#### Custom Profile for Testing
Create a custom profile:
- Download: 500 Kbps
- Upload: 500 Kbps
- Latency: 1000ms
- **Best for**: Balanced testing of all loading states

---

### Common Issues to Check

1. **Flash of Content**
   - [ ] No flash of unstyled content before skeleton
   - [ ] Smooth transition from skeleton to content

2. **Layout Shift**
   - [ ] Skeleton matches actual content dimensions
   - [ ] No layout shift when content loads

3. **Button States**
   - [ ] Buttons properly disabled during loading
   - [ ] Spinner icons visible and animated
   - [ ] Text changes appropriately

4. **Accessibility**
   - [ ] Screen reader announces loading states
   - [ ] Keyboard navigation works correctly
   - [ ] Focus management maintained

5. **Error Handling**
   - [ ] Loading states clear on error
   - [ ] Error messages display properly
   - [ ] User can retry after error

---

### Automated Testing Commands

```bash
# Run component tests
npm test -- --testPathPattern="loading"

# Run E2E tests with network throttling
npm run test:e2e -- --grep "loading states"
```

---

### Performance Metrics

Monitor these metrics during testing:

1. **Time to Interactive (TTI)**
   - Should show skeleton within 100ms
   - Content should load within 3s on Slow 3G

2. **Cumulative Layout Shift (CLS)**
   - Should be < 0.1
   - Skeleton should match content dimensions

3. **First Contentful Paint (FCP)**
   - Skeleton should appear immediately
   - No blank screen

---

### Sign-Off Checklist

After completing all tests:

- [ ] All page-level loading states work correctly
- [ ] All form submission loading states work correctly
- [ ] All delete operation loading states work correctly
- [ ] All inline loading indicators work correctly
- [ ] No layout shifts observed
- [ ] Smooth transitions between states
- [ ] Accessibility features working
- [ ] Error states clear loading indicators
- [ ] Performance metrics acceptable

---

### Notes

Record any issues found during testing:

```
Issue: [Description]
Location: [Component/Page]
Severity: [High/Medium/Low]
Steps to Reproduce:
1. 
2. 
3. 

Expected: [What should happen]
Actual: [What actually happens]
```

---

## Quick Reference: Loading State Locations

| Feature | Component/Page | Loading State Type |
|---------|---------------|-------------------|
| Tournament List | `app/dashboard/tournaments/page.tsx` | Page skeleton |
| Tournament Details | `app/dashboard/tournaments/[id]/page.tsx` | Page skeleton |
| Create Tournament | `app/dashboard/tournaments/new/page.tsx` | Page skeleton + Form button |
| Edit Tournament | `app/dashboard/tournaments/[id]/edit/page.tsx` | Page skeleton + Form button |
| Participants | `app/dashboard/tournaments/[id]/participants/page.tsx` | Page skeleton + Inline |
| Add Match | `app/dashboard/tournaments/[id]/matches/new/page.tsx` | Page skeleton + Form button |
| Edit Match | `app/dashboard/tournaments/[id]/matches/[matchId]/edit/page.tsx` | Page skeleton + Form button |
| Leaderboard | `components/Leaderboard.tsx` | Component skeleton |
| Match List | `components/MatchList.tsx` | Component skeleton + Inline |
| Delete Operations | Various components | Inline + Dialog |

