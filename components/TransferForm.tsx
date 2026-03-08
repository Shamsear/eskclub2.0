"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Player {
  id: number;
  name: string;
  email: string;
  clubId: number | null;
  club: { id: number; name: string } | null;
}

interface Club {
  id: number;
  name: string;
}

interface TransferFormProps {
  players: Player[];
  clubs: Club[];
}

export default function TransferForm({ players, clubs }: TransferFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [toClubId, setToClubId] = useState("");
  const [notes, setNotes] = useState("");

  // Pre-select player from query parameter
  useEffect(() => {
    const playerId = searchParams.get("playerId");
    if (playerId) {
      setSelectedPlayerId(playerId);
    }
  }, [searchParams]);

  const selectedPlayer = players.find(p => p.id === parseInt(selectedPlayerId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: selectedPlayerId,
          toClubId: toClubId || null,
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create transfer");
      }

      router.push("/dashboard/transfers");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {/* Player Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Player *
          </label>
          <select
            required
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Choose a player...</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} - {player.club ? player.club.name : "Free Agent"}
              </option>
            ))}
          </select>
        </div>

        {/* Current Club Display */}
        {selectedPlayer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedPlayer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedPlayer.name}</p>
                <p className="text-sm text-gray-600">
                  Current: {selectedPlayer.club ? (
                    <span className="font-medium text-blue-600">{selectedPlayer.club.name}</span>
                  ) : (
                    <span className="font-medium text-orange-600">Free Agent</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transfer To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transfer To
          </label>
          <select
            value={toClubId}
            onChange={(e) => setToClubId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Free Agent</option>
            {clubs
              .filter(club => club.id !== selectedPlayer?.clubId)
              .map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to transfer player to free agent status
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any notes about this transfer..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Transfer Summary */}
        {selectedPlayer && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Transfer Summary</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {selectedPlayer.club ? selectedPlayer.club.name : "Free Agent"}
              </span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                {toClubId ? clubs.find(c => c.id === parseInt(toClubId))?.name : "Free Agent"}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              ⚠️ Player stats will be tracked separately for each club period
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !selectedPlayerId}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Complete Transfer"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
