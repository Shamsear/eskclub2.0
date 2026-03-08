# End-to-End Tests

This directory contains Playwright E2E tests for the Club Management System built with Next.js 15 and React 19.

## Technology Stack

- **Playwright**: Latest version for E2E testing
- **Next.js**: 15.5.6 with App Router and async params
- **React**: 19.0.0 with Server and Client Components
- **NextAuth.js**: 4.24.11 for authentication

## Test Structure

### Test Files

- `auth.spec.ts` - Admin authentication flows with NextAuth.js 4.24.11
- `clubs.spec.ts` - Club creation, editing, and deletion
- `team-members.spec.ts` - Team member management with role-based workflows
- `search-filter.spec.ts` - Search and filter functionality with role awareness
- `club-hierarchy.spec.ts` - Club hierarchy visualization with multi-role members
- `async-params.spec.ts` - Next.js 15 async params behavior testing

### Helper Files

- `helpers/auth.ts` - Authentication helper functions for login/logout

## Running Tests

### Prerequisites

1. Ensure the database is seeded with test data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

2. Make sure you have the test admin credentials:
   - Username: `admin`
   - Password: `admin123`

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode

```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Run Tests in Debug Mode

```bash
npm run test:e2e:debug
```

### Run Specific Test File

```bash
npx playwright test auth.spec.ts
```

### Run Specific Test

```bash
npx playwright test -g "should successfully login"
```

## Test Coverage

### Authentication Tests
- ✅ Display login page with form
- ✅ Show validation errors for empty fields
- ✅ Show error for invalid credentials
- ✅ Successfully login with valid credentials
- ✅ Redirect to dashboard if already logged in
- ✅ Maintain session across page reloads

### Club Management Tests
- ✅ Display clubs list page
- ✅ Create a new club
- ✅ Show validation errors for empty fields
- ✅ View club details with async params (Next.js 15)
- ✅ Edit an existing club
- ✅ Delete a club with confirmation

### Team Member Management Tests
- ✅ Add team member with single role (PLAYER)
- ✅ Add team member with multiple roles (CAPTAIN + MENTOR)
- ✅ Add manager with MANAGER role
- ✅ Show validation error when no roles selected
- ✅ Edit team member roles
- ✅ Remove role from team member
- ✅ Delete team member

### Search and Filter Tests
- ✅ Search for clubs globally
- ✅ Search for team members with role awareness
- ✅ Filter clubs list
- ✅ Filter team members by role (MANAGER, CAPTAIN, MENTOR)
- ✅ Filter players list by multiple roles
- ✅ Clear filters
- ✅ Persist filters in URL query params

### Club Hierarchy Tests
- ✅ Display club hierarchy with role groupings
- ✅ Show members grouped by their roles
- ✅ Display visual badges for members with multiple roles
- ✅ Show same member in multiple sections if they have multiple roles
- ✅ Make hierarchy members clickable to navigate to profiles
- ✅ Display role color coding in hierarchy
- ✅ Update hierarchy in real-time when roles change
- ✅ Handle async params correctly in hierarchy navigation

### Async Params Tests (Next.js 15)
- ✅ Handle async params in club details route
- ✅ Handle async params in club edit route
- ✅ Handle async params in player details route
- ✅ Handle async params in player edit route
- ✅ Handle async params in manager routes
- ✅ Handle async params in captain routes
- ✅ Handle async params in mentor routes
- ✅ Handle async params when creating new members
- ✅ Handle async params in API routes via form submissions
- ✅ Handle async params when deleting resources
- ✅ Handle async params in nested routes

## Key Features Tested

### Role-Based Architecture
All tests verify the unified role-based architecture where:
- All team members are stored in a single `Player` table
- Roles are assigned through `PlayerRole` junction table
- Members can have multiple roles simultaneously
- Role filtering works correctly across all views

### Next.js 15 Async Params
Tests verify that all routes correctly handle the Next.js 15 breaking change:
- All page components use `params: Promise<{ id: string }>`
- All API routes use async params
- Navigation works correctly with async params
- Form submissions work with async params

### React 19 Components
Tests verify compatibility with React 19:
- Server Components render correctly
- Client Components work with React 19
- Form interactions work properly
- State management works as expected

## Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the project.

Key settings:
- Base URL: `http://localhost:3000`
- Test directory: `./e2e`
- Browser: Chromium (Desktop Chrome)
- Web server: Automatically starts dev server
- Retries: 2 in CI, 0 locally
- Screenshots: On failure only
- Trace: On first retry

## Debugging Tests

### View Test Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### View Traces

If a test fails, view the trace:

```bash
npx playwright show-trace trace.zip
```

### Use Playwright Inspector

Run tests with the inspector:

```bash
npx playwright test --debug
```

## Best Practices

1. **Use data-testid attributes** for stable selectors when possible
2. **Wait for navigation** using `waitForURL()` instead of arbitrary timeouts
3. **Use helper functions** for common operations like login
4. **Test async params behavior** explicitly for Next.js 15 compatibility
5. **Verify role-based filtering** in all member management tests
6. **Test multi-role scenarios** to ensure the role-based architecture works correctly

## Troubleshooting

### Tests Fail Due to Timeout

Increase timeout in `playwright.config.ts`:

```typescript
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

### Database Not Seeded

Run the seed command:

```bash
npx prisma db seed
```

### Port Already in Use

Stop any running dev servers and let Playwright start its own:

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Tests Pass Locally But Fail in CI

Ensure CI environment:
- Has database access
- Has seeded data
- Uses `--ci` flag for Playwright
- Has sufficient resources

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

## Future Enhancements

- [ ] Add visual regression testing
- [ ] Add accessibility testing with axe-core
- [ ] Add performance testing
- [ ] Add mobile viewport testing
- [ ] Add cross-browser testing (Firefox, Safari)
- [ ] Add API mocking for isolated tests
- [ ] Add test data factories
