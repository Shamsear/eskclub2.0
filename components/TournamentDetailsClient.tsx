"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useToast } from "./ui/Toast";
import { MatchList } from "./MatchList";
import { Leaderboard } from "./Leaderboard";

interface TournamentDetailsClientProps {
  tournament: {
    id: number;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date | null;
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    pointsPerGoalScored: number;
    pointsPerGoalConceded: number;
    matchFormat?: string;
    pointSystemTemplate?: {
      id: number;
      name: string;
      description: string | null;
    } | null;
    club: {
      id: number;
      name: string;
      logo: string | null;
    } | null;
    participants: Array<{
      id: number;
      player: {
        id: number;
        name: string;
        email: string;
        photo: string | null;
        club: {
          id: number;
          name: string;
        } | null;
      };
    }>;
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
    playerStats: Array<{
      id: number;
      matchesPlayed: number;
      wins: number;
      draws: number;
      losses: number;
      goalsScored: number;
      goalsConceded: number;
      totalPoints: number;
      conditionalPoints?: number;
      player: {
        id: number;
        name: string;
        photo: string | null;
        club: {
          id: number;
          name: string;
        } | null;
      };
    }>;
    teamStats?: Array<{
      id: string;
      clubId: number;
      club: {
        id: number;
        name: string;
        logo: string | null;
      } | null;
      playerA: {
        id: number;
        name: string;
        photo: string | null;
      } | null;
      playerB: {
        id: number;
        name: string;
        photo: string | null;
      } | null;
      matchesPlayed: number;
      wins: number;
      draws: number;
      losses: number;
      goalsScored: number;
      goalsConceded: number;
      totalPoints: number;
    }>;
    _count: {
      participants: number;
      matches: number;
    };
  };
}

export function TournamentDetailsClient({
  tournament,
}: TournamentDetailsClientProps) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("overview");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tournaments/${tournament.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        showToast(data.error || "Failed to delete tournament", "error");
        return;
      }

      showToast("Tournament deleted successfully", "success");
      router.push("/dashboard/tournaments");
      router.refresh();
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" role="group" aria-label="Tournament actions">
        <Link
          href={`/dashboard/tournaments/${tournament.id}/edit`}
          className="inline-flex items-center justify-center px-4 py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Edit tournament details"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span className="hidden sm:inline">Edit</span>
        </Link>

        <Link
          href={`/dashboard/tournaments/${tournament.id}/participants`}
          className="inline-flex items-center justify-center px-4 py-3 min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Manage tournament participants"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="hidden sm:inline">Participants</span>
        </Link>

        <Link
          href={`/dashboard/tournaments/${tournament.id}/matches/new`}
          className="inline-flex items-center justify-center px-4 py-3 min-h-[44px] bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Add new match result"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="hidden sm:inline">Add Match</span>
        </Link>

        <Link
          href={`/dashboard/tournaments/${tournament.id}/matches/bulk`}
          className="inline-flex items-center justify-center px-4 py-3 min-h-[44px] bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          aria-label="Bulk add match results"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="hidden sm:inline">Bulk Add</span>
        </Link>

        <button
          onClick={() => setShowDeleteDialog(true)}
          className="inline-flex items-center justify-center px-4 py-3 min-h-[44px] bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Delete tournament"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span className="hidden sm:inline">Delete</span>
        </button>

        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto scrollbar-hide" role="tablist" aria-label="Tournament sections">
            <button
              onClick={() => handleTabChange("overview")}
              role="tab"
              aria-selected={currentTab === "overview"}
              aria-controls="overview-panel"
              className={`px-6 md:px-8 py-4 min-h-[44px] text-sm font-semibold whitespace-nowrap border-b-2 transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500 flex items-center gap-2 ${
                currentTab === "overview"
                  ? "border-violet-600 text-violet-600 bg-violet-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overview
            </button>
            <button
              onClick={() => handleTabChange("leaderboard")}
              role="tab"
              aria-selected={currentTab === "leaderboard"}
              aria-controls="leaderboard-panel"
              className={`px-6 md:px-8 py-4 min-h-[44px] text-sm font-semibold whitespace-nowrap border-b-2 transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500 flex items-center gap-2 ${
                currentTab === "leaderboard"
                  ? "border-violet-600 text-violet-600 bg-violet-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Leaderboard
            </button>
            <button
              onClick={() => handleTabChange("matches")}
              role="tab"
              aria-selected={currentTab === "matches"}
              aria-controls="matches-panel"
              className={`px-6 md:px-8 py-4 min-h-[44px] text-sm font-semibold whitespace-nowrap border-b-2 transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500 flex items-center gap-2 ${
                currentTab === "matches"
                  ? "border-violet-600 text-violet-600 bg-violet-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Matches
            </button>
            <button
              onClick={() => handleTabChange("participants")}
              role="tab"
              aria-selected={currentTab === "participants"}
              aria-controls="participants-panel"
              className={`px-6 md:px-8 py-4 min-h-[44px] text-sm font-semibold whitespace-nowrap border-b-2 transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500 flex items-center gap-2 ${
                currentTab === "participants"
                  ? "border-violet-600 text-violet-600 bg-violet-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Participants
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {currentTab === "overview" && (
            <div role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
              <OverviewTab tournament={tournament} />
            </div>
          )}
          {currentTab === "leaderboard" && (
            <div role="tabpanel" id="leaderboard-panel" aria-labelledby="leaderboard-tab">
              <LeaderboardTab tournament={tournament} />
            </div>
          )}
          {currentTab === "matches" && (
            <div role="tabpanel" id="matches-panel" aria-labelledby="matches-tab">
              <MatchesTab tournament={tournament} />
            </div>
          )}
          {currentTab === "participants" && (
            <div role="tabpanel" id="participants-panel" aria-labelledby="participants-tab">
              <ParticipantsTab tournament={tournament} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function OverviewTab({ tournament }: TournamentDetailsClientProps) {
  // Calculate club breakdown
  const clubBreakdown = tournament.participants.reduce(
    (acc, participant) => {
      const clubName = participant.player.club ? participant.player.club.name : "Free Agent";
      acc[clubName] = (acc[clubName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate additional stats
  const totalGoals = tournament.matches.reduce((sum, match) => {
    return sum + match.results.reduce((matchSum, result) => matchSum + result.goalsScored, 0);
  }, 0);

  const avgGoalsPerMatch = tournament._count.matches > 0 
    ? (totalGoals / tournament._count.matches).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{tournament._count.participants}</p>
          <p className="text-sm text-white text-opacity-90">Total Participants</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{tournament._count.matches}</p>
          <p className="text-sm text-white text-opacity-90">Total Matches</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{Object.keys(clubBreakdown).length}</p>
          <p className="text-sm text-white text-opacity-90">Clubs Represented</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{avgGoalsPerMatch}</p>
          <p className="text-sm text-white text-opacity-90">Avg Goals/Match</p>
        </div>
      </div>

      {/* Participating Clubs */}
      {Object.keys(clubBreakdown).length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Participating Clubs</h3>
              <p className="text-sm text-gray-600">Distribution of players across clubs</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(clubBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([clubName, count]) => (
                <div
                  key={clubName}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center group-hover:from-emerald-200 group-hover:to-teal-200 transition-all">
                      <span className="text-lg font-bold text-emerald-700">{count}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block">{clubName}</span>
                      <span className="text-xs text-gray-500">
                        {count === 1 ? '1 player' : `${count} players`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tournament._count.participants === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No participants yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by adding participants to this tournament. You can add them individually or in bulk.
          </p>
          <Link
            href={`/dashboard/tournaments/${tournament.id}/participants`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Participants
          </Link>
        </div>
      )}
    </div>
  );
}

function LeaderboardTab({ tournament }: TournamentDetailsClientProps) {
  // Check if it's a doubles tournament
  if (tournament.matchFormat === 'DOUBLES' && tournament.teamStats) {
    return <TeamLeaderboard tournament={tournament} teamStats={tournament.teamStats} />;
  }

  return (
    <Leaderboard
      tournament={{
        id: tournament.id,
        name: tournament.name,
        pointsPerWin: tournament.pointsPerWin,
        pointsPerDraw: tournament.pointsPerDraw,
        pointsPerLoss: tournament.pointsPerLoss,
        pointsPerGoalScored: tournament.pointsPerGoalScored,
        pointsPerGoalConceded: tournament.pointsPerGoalConceded,
      }}
      stats={tournament.playerStats}
    />
  );
}

// Team Leaderboard Component for Doubles Tournaments
function TeamLeaderboard({ tournament, teamStats }: { 
  tournament: TournamentDetailsClientProps['tournament']; 
  teamStats: NonNullable<TournamentDetailsClientProps['tournament']['teamStats']>;
}) {
  if (teamStats.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No team statistics yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Add doubles match results to see the team leaderboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Team</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">MP</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">W</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">D</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">L</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">GS</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">GC</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Pts</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamStats.map((team, index) => (
              <tr key={team.id} className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all ${index < 3 ? 'bg-gradient-to-r from-yellow-50/30 to-orange-50/30' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center w-10 h-10">
                    {index < 3 ? (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' : 
                        'bg-gradient-to-br from-amber-500 to-orange-600'
                      }`}>
                        <span className="text-xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-700">{index + 1}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {/* Players */}
                    <div className="flex items-center gap-2">
                      {team.playerA?.photo ? (
                        <img src={team.playerA.photo} alt={team.playerA.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-purple-700">{team.playerA?.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{team.playerA?.name}</span>
                      <span className="text-gray-400">&</span>
                      {team.playerB?.photo ? (
                        <img src={team.playerB.photo} alt={team.playerB.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-purple-700">{team.playerB?.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{team.playerB?.name}</span>
                    </div>
                    {/* Club */}
                    <div className="flex items-center gap-2">
                      {team.club?.logo && (
                        <img src={team.club.logo} alt={team.club.name} className="h-5 w-5 object-contain" />
                      )}
                      <span className="text-xs text-gray-500">{team.club?.name || 'Free Agent'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{team.matchesPlayed}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-center font-medium">{team.wins}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{team.draws}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-center font-medium">{team.losses}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{team.goalsScored}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{team.goalsConceded}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-bold text-purple-600">{team.totalPoints}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {teamStats.map((team, index) => (
          <div key={team.id} className={`bg-white border-2 rounded-xl p-4 shadow-md hover:shadow-lg transition-all ${
            index < 3 ? 'border-yellow-300 bg-gradient-to-br from-yellow-50/50 to-orange-50/50' : 'border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10">
                  {index < 3 ? (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' : 
                      'bg-gradient-to-br from-amber-500 to-orange-600'
                    }`}>
                      <span className="text-xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700">#{index + 1}</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {team.playerA?.photo ? (
                      <img src={team.playerA.photo} alt={team.playerA.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-700">{team.playerA?.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-900">{team.playerA?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {team.playerB?.photo ? (
                      <img src={team.playerB.photo} alt={team.playerB.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-700">{team.playerB?.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-900">{team.playerB?.name}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {team.club?.logo && (
                      <img src={team.club.logo} alt={team.club.name} className="h-4 w-4 object-contain" />
                    )}
                    <span className="text-xs text-gray-500">{team.club?.name || 'Free Agent'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{team.totalPoints}</div>
                <div className="text-xs text-gray-500 font-medium">points</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-200">
              <div className="text-center bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-600 mb-1 font-medium">MP</div>
                <div className="text-sm font-bold text-gray-900">{team.matchesPlayed}</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-600 mb-1 font-medium">W/D/L</div>
                <div className="text-xs font-bold text-gray-900">{team.wins}/{team.draws}/{team.losses}</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-600 mb-1 font-medium">GS</div>
                <div className="text-sm font-bold text-gray-900">{team.goalsScored}</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-600 mb-1 font-medium">GC</div>
                <div className="text-sm font-bold text-gray-900">{team.goalsConceded}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchesTab({ tournament }: TournamentDetailsClientProps) {
  return <MatchList tournamentId={tournament.id} matches={tournament.matches} />;
}

function ParticipantsTab({ tournament }: TournamentDetailsClientProps) {
  if (tournament.participants.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No participants yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Get started by adding participants to this tournament.
        </p>
        <Link
          href={`/dashboard/tournaments/${tournament.id}/participants`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Manage Participants
        </Link>
      </div>
    );
  }

  // Group participants by club
  const participantsByClub = tournament.participants.reduce((acc, participant) => {
    const clubName = participant.player.club ? participant.player.club.name : "Free Agent";
    if (!acc[clubName]) {
      acc[clubName] = [];
    }
    acc[clubName].push(participant);
    return acc;
  }, {} as Record<string, typeof tournament.participants>);

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">All Participants</h3>
            <p className="text-sm text-gray-600">{tournament.participants.length} players registered</p>
          </div>
        </div>
        <Link
          href={`/dashboard/tournaments/${tournament.id}/participants`}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage
        </Link>
      </div>

      {/* Grouped by Club */}
      {Object.entries(participantsByClub).map(([clubName, clubParticipants]) => (
        <div key={clubName} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900">{clubName}</h4>
            <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              {clubParticipants.length} {clubParticipants.length === 1 ? 'player' : 'players'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clubParticipants.map((participant) => (
              <div
                key={participant.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-purple-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  {participant.player.photo ? (
                    <img
                      src={participant.player.photo}
                      alt={participant.player.name}
                      className="h-14 w-14 rounded-xl object-cover flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-purple-200 transition-all"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-purple-200 transition-all">
                      <span className="text-xl font-bold text-purple-700">
                        {participant.player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                      {participant.player.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {participant.player.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}