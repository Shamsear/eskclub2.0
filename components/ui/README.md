# UI Components Documentation

This directory contains reusable UI components for the Club Management System.

## Components

### Button
A versatile button component with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (default: false) - Shows loading spinner
- All standard HTML button attributes

**Example:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

### Input
A form input component with label, error, and helper text support.

**Props:**
- `label`: string (optional) - Label text
- `error`: string (optional) - Error message to display
- `helperText`: string (optional) - Helper text below input
- All standard HTML input attributes

**Example:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  error={errors.email}
  helperText="We'll never share your email"
/>
```

### Card
A container component for displaying content with optional header and footer.

**Components:**
- `Card`: Main container
- `CardHeader`: Header section with border
- `CardTitle`: Title text with styling
- `CardContent`: Main content area
- `CardFooter`: Footer section with border

**Props (Card):**
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `hover`: boolean (default: false) - Adds hover effect

**Example:**
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

<Card padding="md" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Modal
A dialog component for displaying content in an overlay.

**Props:**
- `isOpen`: boolean - Controls modal visibility
- `onClose`: () => void - Callback when modal closes
- `title`: string (optional) - Modal title
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `showCloseButton`: boolean (default: true)

**Example:**
```tsx
import { Modal, ModalFooter } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit User"
  size="md"
>
  <p>Modal content</p>
  <ModalFooter>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </ModalFooter>
</Modal>
```

### Toast
A notification system for displaying temporary messages.

**Usage:**
1. Wrap your app with `ToastProvider` (already done in Providers.tsx)
2. Use the `useToast` hook in components

**Hook:**
- `showToast(message: string, type?: ToastType)`: Display a toast
- `hideToast(id: string)`: Manually hide a toast

**Toast Types:**
- 'success': Green notification
- 'error': Red notification
- 'warning': Yellow notification
- 'info': Blue notification (default)

**Example:**
```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { showToast } = useToast();
  
  const handleSuccess = () => {
    showToast('Operation successful!', 'success');
  };
  
  return <Button onClick={handleSuccess}>Save</Button>;
}
```

### LoadingSpinner
A spinner component for indicating loading states.

**Components:**
- `LoadingSpinner`: Inline spinner
- `LoadingOverlay`: Full-screen overlay with spinner

**Props (LoadingSpinner):**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `text`: string (optional) - Text to display below spinner

**Props (LoadingOverlay):**
- `isLoading`: boolean - Controls overlay visibility
- `text`: string (optional) - Text to display below spinner

**Example:**
```tsx
import { LoadingSpinner, LoadingOverlay } from '@/components/ui';

// Inline spinner
<LoadingSpinner size="md" text="Loading..." />

// Full-screen overlay
<LoadingOverlay isLoading={isLoading} text="Processing..." />
```

### ConfirmDialog
A specialized modal for confirmation dialogs.

**Props:**
- `isOpen`: boolean - Controls dialog visibility
- `onClose`: () => void - Callback when dialog closes
- `onConfirm`: () => void - Callback when user confirms
- `title`: string (default: 'Confirm Action')
- `message`: string - Confirmation message
- `confirmText`: string (default: 'Confirm')
- `cancelText`: string (default: 'Cancel')
- `variant`: 'danger' | 'warning' | 'info' (default: 'danger')
- `isLoading`: boolean (default: false)

**Example:**
```tsx
import { ConfirmDialog } from '@/components/ui';

<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete User"
  message="Are you sure you want to delete this user? This action cannot be undone."
  confirmText="Delete"
  variant="danger"
/>
```

## Testing

To test all components, navigate to `/test-components` in your browser during development.

## Accessibility

All components follow accessibility best practices:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Color contrast compliance
