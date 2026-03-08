"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ParticipantSelector } from "./ParticipantSelector";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useToast } from "./ui/Toast";

interface Player {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  club: {
    id: number;
    name: string;
  } | null;
}

interface Participant {
  id: number;
  player: Player;
}

interface ParticipantsListProps {
  tournamentId: number;
  participants: Participant[];
  allPlayers: Player[];
}

export function ParticipantsList({
  tournamentId,
  participants,
  allPlayers,
}: ParticipantsListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [removingPlayerId, setRemovingPlayerId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleRemoveClick = (playerId: number, playerName: string) => {
    setParticipantToRemove({ id: playerId, name: playerName });
    setShowDeleteDialog(true);
  };

  const handleCancelRemove = () => {
    setShowDeleteDialog(false);
    setParticipantToRemove(null);
  };

  const handleConfirmRemove = async () => {
    if (!participantToRemove) return;

    setRemovingPlayerId(participantToRemove.id);

    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/participants/${participantToRemove.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Failed to remove participant", "error");
        return;
      }

      if (data.warning) {
        showToast(`${data.message}. ${data.warning}`, "success");
      } else {
        showToast(data.message || "Participant removed successfully", "success");
      }

      setShowDeleteDialog(false);
      setParticipantToRemove(null);
      router.refresh();
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setRemovingPlayerId(null);
    }
  };

  const handleAddParticipants = () => {
    setShowAddForm(!showAddForm);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };

  const handleParticipantsAdded = () => {
    setShowAddForm(false);
    router.refresh();
  };

  if (participants.length === 0) {
    return (
      <>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No participants yet
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
              Get started by adding participants to this tournament. You can add multiple players at once.
            </p>
            <button
              onClick={handleAddParticipants}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all font-semibold"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Participants
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="mt-6">
            <ParticipantSelector
              tournamentId={tournamentId}
              allPlayers={allPlayers}
              existingParticipantIds={[]}
              onClose={handleCloseAddForm}
              onSuccess={handleParticipantsAdded}
              inline={true}
            />
          </div>
        )}
      </>
    );
  }

  const existingParticipantIds = participants.map((p) => p.player.id);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header with Add Button */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Participants ({participants.length})
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Players currently participating in this tournament
                </p>
              </div>
            </div>
            <button
              onClick={handleAddParticipants}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all font-semibold"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add More
            </button>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="group bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    {participant.player.photo ? (
                      <img
                        src={participant.player.photo}
                        alt={participant.player.name}
                        className="h-14 w-14 rounded-xl mr-3 object-cover flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-emerald-300 transition-all"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mr-3 flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-emerald-300 transition-all">
                        <span className="text-xl font-bold text-emerald-700">
                          {participant.player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {participant.player.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {participant.player.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {participant.player.club ? participant.player.club.name : "Free Agent"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleRemoveClick(
                        participant.player.id,
                        participant.player.name
                      )
                    }
                    disabled={removingPlayerId === participant.player.id}
                    className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    title="Remove participant"
                    aria-label={`Remove ${participant.player.name}`}
                  >
                    {removingPlayerId === participant.player.id ? (
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Add Button - Shows when there are many participants */}
        {!showAddForm && participants.length >= 6 && (
          <div className="px-6 pb-6">
            <button
              onClick={handleAddParticipants}
              className="w-full flex items-center justify-center px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all font-semibold"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add More Participants
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Participants</h3>
                <p className="text-sm text-gray-600 mt-0.5">Select players to add to this tournament</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ParticipantSelector
              tournamentId={tournamentId}
              allPlayers={allPlayers}
              existingParticipantIds={existingParticipantIds}
              onClose={handleCloseAddForm}
              onSuccess={handleParticipantsAdded}
              inline={true}
            />
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        isLoading={removingPlayerId !== null}
        title="Remove Participant?"
        message={
          participantToRemove
            ? `Are you sure you want to remove ${participantToRemove.name} from this tournament? If they have match results, those statistics will also be deleted. This action cannot be undone.`
            : ""
        }
        confirmText="Remove"
      />
    </>
  );
}
