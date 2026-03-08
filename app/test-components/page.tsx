'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Modal,
  ModalFooter,
  useToast,
  LoadingSpinner,
  LoadingOverlay,
  ConfirmDialog,
} from '@/components/ui';

function TestComponentsContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const { showToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length < 3) {
      setInputError('Must be at least 3 characters');
    } else {
      setInputError('');
    }
  };

  const handleConfirm = () => {
    showToast('Action confirmed!', 'success');
    setIsConfirmOpen(false);
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Loading complete!', 'success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">UI Components Test Page</h1>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="primary" isLoading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Input Component */}
        <Card>
          <CardHeader>
            <CardTitle>Input Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <Input
                label="Username"
                placeholder="Enter username"
                value={inputValue}
                onChange={handleInputChange}
                error={inputError}
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email"
                helperText="We'll never share your email"
              />
              <Input
                label="Disabled Input"
                disabled
                value="Cannot edit"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="sm">
            <CardTitle>Small Padding</CardTitle>
            <p className="text-gray-600 mt-2">This card has small padding</p>
          </Card>
          <Card padding="md" hover>
            <CardTitle>Medium Padding (Hover)</CardTitle>
            <p className="text-gray-600 mt-2">Hover over this card</p>
          </Card>
          <Card padding="lg">
            <CardTitle>Large Padding</CardTitle>
            <p className="text-gray-600 mt-2">This card has large padding</p>
          </Card>
        </div>

        {/* Card with Footer */}
        <Card>
          <CardHeader>
            <CardTitle>Card with Footer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <div className="flex justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button variant="primary">Save</Button>
            </div>
          </CardFooter>
        </Card>

        {/* Modal & Toast */}
        <Card>
          <CardHeader>
            <CardTitle>Modal & Toast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
              <Button onClick={() => showToast('This is an info message', 'info')}>
                Show Info Toast
              </Button>
              <Button onClick={() => showToast('Success message!', 'success')}>
                Show Success Toast
              </Button>
              <Button onClick={() => showToast('Warning message!', 'warning')}>
                Show Warning Toast
              </Button>
              <Button onClick={() => showToast('Error message!', 'error')}>
                Show Error Toast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Loading Spinners:</p>
                <div className="flex items-center gap-6">
                  <LoadingSpinner size="sm" />
                  <LoadingSpinner size="md" />
                  <LoadingSpinner size="lg" />
                  <LoadingSpinner size="xl" text="Loading..." />
                </div>
              </div>
              <div>
                <Button onClick={simulateLoading}>Simulate Loading Overlay</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Dialog */}
        <Card>
          <CardHeader>
            <CardTitle>Confirm Dialog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => setIsConfirmOpen(true)} variant="danger">
                Delete Item
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
      >
        <p className="text-gray-600 mb-4">
          This is a modal dialog. You can put any content here.
        </p>
        <Input label="Name" placeholder="Enter your name" />
        <ModalFooter className="mt-6">
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Save
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} text="Processing..." />
    </div>
  );
}

export default function TestComponentsPage() {
  return <TestComponentsContent />;
}
