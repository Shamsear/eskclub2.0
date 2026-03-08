'use client';

import { ConfirmDialog } from './ui/ConfirmDialog';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = 'Delete Tournament?',
  message = 'This will permanently delete the tournament, all participants, matches, and statistics. This action cannot be undone.',
  confirmText = 'Delete',
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText="Cancel"
      variant="danger"
      isLoading={isLoading}
    />
  );
}
