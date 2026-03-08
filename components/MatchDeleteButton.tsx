'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface MatchDeleteButtonProps {
  matchId: string;
  tournamentId: string;
  clubId: string;
}

export function MatchDeleteButton({
  matchId,
  tournamentId,
  clubId,
}: MatchDeleteButtonProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete match');
        return;
      }

      router.push(`/dashboard/clubs/${clubId}/tournaments/${tournamentId}`);
      router.refresh();
    } catch (error) {
      alert('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">
          Deleting this match will remove all player results and recalculate tournament statistics. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
          Delete Match
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Match"
        message="Are you sure you want to delete this match? All player results will be removed and tournament statistics will be recalculated. This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
