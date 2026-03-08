"use client";

import { useState, useMemo } from "react";
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

interface ParticipantSelectorProps {
  tournamentId: number;
  allPlayers: Player[];
  existingParticipantIds: number[];
  onClose: () => void;
  onSuccess: () => void;
  inline?: boolean;
}

export function ParticipantSelector({
  tournamentId,
  allPlayers,
  existingParticipantIds,
  onClose,
  onSuccess,
  inline = false,
}: ParticipantSelectorProps) {
  const { showToast } = useToast();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get unique clubs from all players
  const clubs = useMemo(() => {
    const clubMap = new Map<number, { id: number; name: string }>();
    allPlayers.forEach((player) => {
      if (player.club && !clubMap.has(player.club.id)) {
        clubMap.set(player.club.id, player.club);
      }
    });
    return Array.from(clubMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [allPlayers]);

  // Filter players based on search and club filter
  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((player) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by club
      const matchesClub =
        selectedClubId === null || (player.club && player.club.id === selectedClubId);

      return matchesSearch && matchesClub;
    });
  }, [allPlayers, searchQuery, selectedClubId]);

  // Separate already-selected players from available players
  const { alreadySelected, availablePlayers } = useMemo(() => {
    const alreadySelected = filteredPlayers.filter((player) =>
      existingParticipantIds.includes(player.id)
    );
    const availablePlayers = filteredPlayers.filter(
      (player) => !existingParticipantIds.includes(player.id)
    );
    return { alreadySelected, availablePlayers };
  }, [filteredPlayers, existingParticipantIds]);

  const handleTogglePlayer = (playerId: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSelectAll = () => {
    const availableIds = availablePlayers.map((p) => p.id);
    setSelectedPlayerIds(availableIds);
  };

  const handleDeselectAll = () => {
    setSelectedPlayerIds([]);
  };

  const handleSubmit = async () => {
    if (selectedPlayerIds.length === 0) {
      showToast("Please select at least one player", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/participants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerIds: selectedPlayerIds,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Failed to add participants", "error");
        return;
      }

      showToast(
        data.message || "Participants added successfully",
        "success"
      );
      onSuccess();
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className={inline ? "flex flex-col" : "bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col"}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 id="participant-selector-title" className="text-xl sm:text-2xl font-bold text-gray-900">
              Add Participants
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
              aria-label="Close participant selector"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p id="participant-selector-description" className="text-xs sm:text-sm text-gray-500 mt-1">
            Select players from any club to add to this tournament
          </p>
        </div>

        {/* Search and Filter */}
        <div className="p-4 sm:p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search Players
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            {/* Club Filter */}
            <div className="w-full sm:w-64">
              <label
                htmlFor="club-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Club
              </label>
              <select
                id="club-filter"
                value={selectedClubId || ""}
                onChange={(e) =>
                  setSelectedClubId(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="">All Clubs</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selection Actions */}
          {availablePlayers.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-gray-600">
                {selectedPlayerIds.length} player(s) selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-2 min-h-[44px] hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Select all available players"
                >
                  Select All
                </button>
                {selectedPlayerIds.length > 0 && (
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium px-3 py-2 min-h-[44px] hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    aria-label="Deselect all players"
                  >
                    Deselect All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Top Action Bar */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-y border-blue-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Selection Summary */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPlayerIds.length === 0 ? (
                        "No players selected"
                      ) : (
                        <>
                          <span className="text-blue-600">{selectedPlayerIds.length}</span> player{selectedPlayerIds.length !== 1 ? 's' : ''} selected
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-600">
                      {availablePlayers.length} available to add
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 min-h-[40px] bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm"
                  aria-label="Cancel and close"
                >
                  <span className="hidden sm:inline">Cancel</span>
                  <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedPlayerIds.length === 0}
                  className="px-5 py-2 min-h-[40px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                  aria-label={isSubmitting ? "Adding participants" : `Add ${selectedPlayerIds.length} selected player${selectedPlayerIds.length !== 1 ? 's' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                      <span className="hidden sm:inline">Adding...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="hidden sm:inline">
                        Add {selectedPlayerIds.length} Player{selectedPlayerIds.length !== 1 ? "s" : ""}
                      </span>
                      <span className="sm:hidden">
                        Add ({selectedPlayerIds.length})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {availablePlayers.length === 0 && alreadySelected.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No players found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {availablePlayers.length === 0 && alreadySelected.length > 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                All matching players are already participants
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Available Players */}
            {availablePlayers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Available Players ({availablePlayers.length})
                </h3>
                <div className="space-y-2">
                  {availablePlayers.map((player) => (
                    <label
                      key={player.id}
                      className="flex items-start sm:items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors min-h-[60px]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlayerIds.includes(player.id)}
                        onChange={() => handleTogglePlayer(player.id)}
                        className="h-5 w-5 mt-1 sm:mt-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                        aria-label={`Select ${player.name}${player.club ? ` from ${player.club.name}` : ''}`}
                      />
                      <div className="ml-3 flex flex-col sm:flex-row sm:items-center flex-1 min-w-0 gap-2">
                        <div className="flex items-center flex-1 min-w-0">
                          {player.photo ? (
                            <img
                              src={player.photo}
                              alt={player.name}
                              className="h-10 w-10 rounded-full mr-3 object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="text-sm font-medium text-gray-600">
                                {player.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm sm:text-base">
                              {player.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {player.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 sm:ml-4 pl-13 sm:pl-0">
                          {player.club ? player.club.name : "Free Agent"}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Already Selected Players */}
            {alreadySelected.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Already Participants ({alreadySelected.length})
                </h3>
                <div className="space-y-2">
                  {alreadySelected.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-60"
                    >
                      <div className="h-4 w-4 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3 flex items-center flex-1">
                        {player.photo ? (
                          <img
                            src={player.photo}
                            alt={player.name}
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-600">
                              {player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {player.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {player.email}
                          </p>
                        </div>
                        <div className="ml-4 text-sm text-gray-500">
                          {player.club ? player.club.name : "Free Agent"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Cancel and close"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedPlayerIds.length === 0}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isSubmitting ? "Adding participants" : `Add ${selectedPlayerIds.length} selected player${selectedPlayerIds.length !== 1 ? 's' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  Adding...
                </>
              ) : (
                <>
                  Add {selectedPlayerIds.length} Player
                  {selectedPlayerIds.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="participant-selector-title"
      aria-describedby="participant-selector-description"
    >
      {content}
    </div>
  );
}
