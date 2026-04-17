"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";
import { MatchListSkeleton } from "./MatchListSkeleton";

interface MatchListProps {
  tournamentId: number;
  matches: Array<{
    id: number;
    matchDate: Date;
    isTeamMatch: boolean;
    results: Array<{
      id: number;
      outcome: string;
      goalsScored: number;
      goalsConceded: number;
      pointsEarned: number;
      player: {
        id: number;
        name: string;
        photo: string | null;
      } | null;
    }>;
    teamResults?: Array<{
      id: number;
      teamPosition: number;
      outcome: string;
      goalsScored: number;
      goalsConceded: number;
      pointsEarned: number;
      club: {
        id: number;
        name: string;
        logo: string | null;
      } | null;
      playerA: {
        id: number;
        name: string;
        photo: string | null;
      };
      playerB: {
        id: number;
        name: string;
        photo: string | null;
      };
    }>;
  }>;
  isLoading?: boolean;
}

export { MatchListSkeleton };

export function MatchList({ tournamentId, matches, isLoading = false }: MatchListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [deletingMatchId, setDeletingMatchId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null);

  if (isLoading) {
    return <MatchListSkeleton />;
  }

  const handleDelete = async (matchId: number) => {
    setDeletingMatchId(matchId);

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        showToast(data.error || "Failed to delete match", "error");
        return;
      }

      showToast("Match deleted successfully", "success");
      router.refresh();
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setDeletingMatchId(null);
      setShowDeleteDialog(null);
    }
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No matches yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Get started by adding match results to track player performance.
        </p>
        <Link
          href={`/dashboard/tournaments/${tournamentId}/matches/new`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Match Result
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Match History</h3>
            <p className="text-sm text-gray-600">{matches.length} {matches.length === 1 ? 'match' : 'matches'} played</p>
          </div>
        </div>
        <Link
          href={`/dashboard/tournaments/${tournamentId}/matches/new`}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Match
        </Link>
      </div>

      {matches.map((match) => {
        // Check if this is a team match (doubles)
        const isTeamMatch = match.isTeamMatch && match.teamResults && match.teamResults.length > 0;
        
        if (isTeamMatch) {
          // Doubles match - display teams
          const team1 = match.teamResults![0];
          const team2 = match.teamResults![1];
          
          return (
            <article
              key={match.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all group"
              aria-label={`Doubles match from ${new Date(match.matchDate).toLocaleDateString()}`}
            >
              {/* Match Header */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-purple-700">
                    Doubles - {new Date(match.matchDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/tournaments/${tournamentId}/matches/${match.id}/edit`}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded-lg transition-all"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowDeleteDialog(match.id)}
                    disabled={deletingMatchId === match.id}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingMatchId === match.id ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Match Content - 2v2 Display */}
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  {/* Team 1 */}
                  <div className="flex-1">
                    <div className="mb-3">
                      {team1.club && (
                        <div className="flex items-center gap-2 mb-2">
                          {team1.club.logo && (
                            <img src={team1.club.logo} alt={team1.club.name} className="w-6 h-6 rounded object-contain" />
                          )}
                          <span className="text-sm font-semibold text-gray-700">{team1.club.name}</span>
                        </div>
                      )}
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center gap-2">
                          {team1.playerA.photo ? (
                            <img src={team1.playerA.photo} alt={team1.playerA.name} className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-700">{team1.playerA.name.charAt(0)}</span>
                            </div>
                          )}
                          <span className="text-sm text-gray-900">{team1.playerA.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {team1.playerB.photo ? (
                            <img src={team1.playerB.photo} alt={team1.playerB.name} className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-700">{team1.playerB.name.charAt(0)}</span>
                            </div>
                          )}
                          <span className="text-sm text-gray-900">{team1.playerB.name}</span>
                        </div>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        team1.outcome === "WIN" ? "bg-green-100 text-green-800" :
                        team1.outcome === "DRAW" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                      }`}>
                        {team1.outcome}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600">{team1.goalsScored} scored</span>
                      <span className="text-gray-600">{team1.goalsConceded} conceded</span>
                      {team1.club && (
                        <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                          {team1.pointsEarned} pts
                        </span>
                      )}
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">VS</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {team1.goalsScored} - {team2.goalsScored}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex-1 text-right">
                    <div className="mb-3">
                      {team2.club && (
                        <div className="flex items-center gap-2 mb-2 justify-end">
                          <span className="text-sm font-semibold text-gray-700">{team2.club.name}</span>
                          {team2.club.logo && (
                            <img src={team2.club.logo} alt={team2.club.name} className="w-6 h-6 rounded object-contain" />
                          )}
                        </div>
                      )}
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm text-gray-900">{team2.playerA.name}</span>
                          {team2.playerA.photo ? (
                            <img src={team2.playerA.photo} alt={team2.playerA.name} className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-purple-700">{team2.playerA.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm text-gray-900">{team2.playerB.name}</span>
                          {team2.playerB.photo ? (
                            <img src={team2.playerB.photo} alt={team2.playerB.name} className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-purple-700">{team2.playerB.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        team2.outcome === "WIN" ? "bg-green-100 text-green-800" :
                        team2.outcome === "DRAW" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                      }`}>
                        {team2.outcome}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm justify-end">
                      {team2.club && (
                        <span className="mr-auto px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                          {team2.pointsEarned} pts
                        </span>
                      )}
                      <span className="text-gray-600">{team2.goalsConceded} conceded</span>
                      <span className="text-gray-600">{team2.goalsScored} scored</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        }
        
        // Singles match - display 1v1
        const player1 = match.results[0];
        const player2 = match.results[1];
        
        return (
          <article
            key={match.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all group"
            aria-label={`Match from ${new Date(match.matchDate).toLocaleDateString()}`}
          >
            {/* Match Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">
                  {new Date(match.matchDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/tournaments/${tournamentId}/matches/${match.id}/edit`}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded-lg transition-all"
                  aria-label={`Edit match from ${new Date(match.matchDate).toLocaleDateString()}`}
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteDialog(match.id)}
                  disabled={deletingMatchId === match.id}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Delete match from ${new Date(match.matchDate).toLocaleDateString()}`}
                >
                  {deletingMatchId === match.id ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Match Content - 1v1 Display */}
            <div className="p-5">
              <div className="flex items-center justify-between gap-4">
                {/* Player 1 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {player1?.player ? (
                      <>
                        {player1.player.photo ? (
                          <img
                            src={player1.player.photo}
                            alt={player1.player.name}
                            className="h-12 w-12 rounded-xl object-cover ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center ring-2 ring-gray-100">
                            <span className="text-lg font-bold text-blue-700">
                              {player1.player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{player1.player.name}</h4>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            player1.outcome === "WIN"
                              ? "bg-green-100 text-green-800"
                              : player1.outcome === "DRAW"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {player1.outcome}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-gray-100">
                          <span className="text-lg font-bold text-gray-600">?</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">External Player</h4>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            player1?.outcome === "WIN"
                              ? "bg-green-100 text-green-800"
                              : player1?.outcome === "DRAW"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {player1?.outcome}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-gray-600">{player1?.goalsScored} scored</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                      <span className="text-gray-600">{player1?.goalsConceded} conceded</span>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                        {player1?.pointsEarned} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center gap-2 px-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">VS</span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {player1?.goalsScored} - {player2?.goalsScored}
                    </div>
                  </div>
                </div>

                {/* Player 2 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-row-reverse">
                    {player2?.player ? (
                      <>
                        {player2.player.photo ? (
                          <img
                            src={player2.player.photo}
                            alt={player2.player.name}
                            className="h-12 w-12 rounded-xl object-cover ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center ring-2 ring-gray-100">
                            <span className="text-lg font-bold text-purple-700">
                              {player2.player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0 text-right">
                          <h4 className="font-semibold text-gray-900 truncate">{player2.player.name}</h4>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            player2.outcome === "WIN"
                              ? "bg-green-100 text-green-800"
                              : player2.outcome === "DRAW"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {player2.outcome}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-gray-100">
                          <span className="text-lg font-bold text-gray-600">?</span>
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <h4 className="font-semibold text-gray-900 truncate">External Player</h4>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            player2?.outcome === "WIN"
                              ? "bg-green-100 text-green-800"
                              : player2?.outcome === "DRAW"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {player2?.outcome}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm justify-end">
                    <div className="mr-auto">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                        {player2?.pointsEarned} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">{player2?.goalsConceded} conceded</span>
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">{player2?.goalsScored} scored</span>
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-match-title"
          aria-describedby="delete-match-description"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 id="delete-match-title" className="text-lg font-semibold text-gray-900 mb-2">
              Delete Match?
            </h3>
            <p id="delete-match-description" className="text-sm text-gray-600 mb-6">
              This will permanently delete the match and recalculate player
              statistics. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(null)}
                disabled={deletingMatchId !== null}
                className="px-4 py-2 min-h-[44px] text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteDialog)}
                disabled={deletingMatchId !== null}
                className="px-4 py-2 min-h-[44px] text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Confirm deletion"
              >
                {deletingMatchId === showDeleteDialog ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
