# Error Handling Guide

This document describes the comprehensive error handling system implemented in the Club Management System.

## Overview

The application uses a centralized error handling approach with:
- Custom error classes for different error types
- Standardized error responses across all API routes
- User-friendly error pages for different scenarios
- Form validation with clear error messages
- Error logging for debugging and monitoring

## Error Handling Components

### 1. Error Utility Library (`lib/errors.ts`)

The core error handling utilities include:

#### Custom Error Classes

```typescript
// Base application error
class AppError extends Error {
  statusCode: number;
  code?: string;
}

// Specific error types
class ValidationError extends AppError      // 400 Bad Request
class UnauthorizedError extends AppError    // 401 Unauthorized
class ForbiddenError extends AppError       // 403 Forbidden
class NotFoundError extends AppError        // 404 Not Found
class ConflictError extends AppError        // 409 Conflict
```

#### Error Response Creator

```typescript
createErrorResponse(error: unknown): NextResponse
```

Automatically handles:
- Zod validation errors
- Prisma database errors
- Custom AppErrors
- Generic JavaScript errors

#### Error Logger

```typescript
logError(error: unknown, context?: Record<string, any>)
```

Logs errors with timestamp and context for debugging.

### 2. Error Pages

#### Root Error Page (`app/error.tsx`)
- Catches errors in the root app directory
- Shows user-friendly error message
- Displays error details in development mode
- Provides "Try Again" and "Go to Dashboard" actions

#### Dashboard Error Page (`app/dashboard/error.tsx`)
- Catches errors in dashboard routes
- Maintains dashboard layout context
- Provides recovery options

#### Not Found Pages
- `app/not-found.tsx` - Root 404 page
- `app/dashboard/not-found.tsx` - Dashboard 404 page

### 3. Error Boundary Component (`components/ErrorBoundary.tsx`)

React error boundary that catches component errors:

```tsx
<ErrorBoundary fallback={<CustomFallback />}>
  <YourComponent />
</ErrorBoundary>
```

Features:
- Catches React rendering errors
- Logs errors with component stack
- Shows fallback UI
- Provides recovery actions

### 4. Form Error Components (`components/FormError.tsx`)

#### FormError
Displays field-level validation errors:

```tsx
<FormError error={errors.fieldName} />
```

#### ErrorMessage
Displays general error messages with dismiss option:

```tsx
<ErrorMessage
  title="Error"
  message="Something went wrong"
  onDismiss={() => setError(null)}
/>
```

#### SuccessMessage
Displays success messages:

```tsx
<SuccessMessage
  title="Success"
  message="Operation completed successfully"
  onDismiss={() => setSuccess(null)}
/>
```

## Usage Examples

### API Route Error Handling

```typescript
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError 
} from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new UnauthorizedError();
    }

    const data = await prisma.model.findUnique({ where: { id } });
    
    if (!data) {
      throw new NotFoundError("Resource");
    }

    return NextResponse.json(data);
  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### Form Validation with Error Display

```tsx
import { ErrorMessage } from '@/components/FormError';

function MyForm() {
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Field-specific errors from Zod validation
          setErrors(data.details);
        } else {
          // General error message
          setErrors({ submit: data.error });
        }
        return;
      }

      // Success handling
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
      />
      
      {errors.submit && (
        <ErrorMessage
          title="Submission Error"
          message={errors.submit}
          onDismiss={() => setErrors({ ...errors, submit: undefined })}
        />
      )}
      
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Role Validation

The system includes specific validation for role requirements:

```typescript
import { validateRoles } from '@/lib/errors';

// In API route
const { roles } = validationResult.data;
validateRoles(roles); // Throws ValidationError if no roles selected
```

The Zod schema also enforces this:

```typescript
roles: z.array(z.nativeEnum(RoleType)).min(1, "At least one role is required")
```

## Error Response Format

All API errors follow a consistent format:

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Invalid email format"],
    "roles": ["At least one role is required"]
  }
}
```

### Not Found Error (404)
```json
{
  "error": "Club not found",
  "code": "NOT_FOUND"
}
```

### Unauthorized Error (401)
```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

### Conflict Error (409)
```json
{
  "error": "A record with this email already exists",
  "code": "CONFLICT"
}
```

### Server Error (500)
```json
{
  "error": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

## Prisma Error Handling

The system automatically converts Prisma errors to user-friendly messages:

- `P2002` (Unique constraint) → ConflictError
- `P2025` (Record not found) → NotFoundError
- `P2003` (Foreign key constraint) → ValidationError

## Best Practices

1. **Always use try-catch in API routes**
   ```typescript
   try {
     // Your logic
   } catch (error) {
     return createErrorResponse(error);
   }
   ```

2. **Throw specific error types**
   ```typescript
   if (!session) throw new UnauthorizedError();
   if (!data) throw new NotFoundError("Resource");
   if (invalid) throw new ValidationError("Invalid input");
   ```

3. **Use Zod for validation**
   ```typescript
   const result = schema.safeParse(body);
   if (!result.success) throw result.error;
   ```

4. **Display user-friendly messages**
   - Use ErrorMessage component for API errors
   - Use FormError for field-level errors
   - Provide clear, actionable error messages

5. **Log errors with context**
   ```typescript
   logError(error, { userId, action: 'create_club' });
   ```

6. **Validate roles**
   - Always check that at least one role is selected
   - Use the built-in validation in playerSchema
   - Display clear error messages for role requirements

## Testing Error Handling

Test different error scenarios:

1. **Validation errors**: Submit forms with invalid data
2. **Authentication errors**: Access protected routes without login
3. **Not found errors**: Request non-existent resources
4. **Conflict errors**: Create duplicate records
5. **Network errors**: Simulate network failures
6. **Role validation**: Try to submit forms without selecting roles

## Future Enhancements

Consider adding:
- Error tracking service integration (Sentry, Rollbar)
- User-facing error reporting
- Retry mechanisms for transient errors
- Rate limiting error responses
- Detailed error analytics
