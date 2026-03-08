'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Club {
  id: number;
  name: string;
  logo: string | null;
  totalPoints: number;
  totalMatches: number;
  totalWins: number;
  totalDraws: number;
  totalLosses: number;
  totalGoalsScored: number;
  totalGoalsConceded: number;
  goalDifference: number;
  avgPointsPerMatch: number;
  playerCount: number;
  tournamentCount: number;
  tournamentStats: Record<number, {
    totalPoints: number;
    totalMatches: number;
    totalWins: number;
    totalDraws: number;
    totalLosses: number;
    totalGoalsScored: number;
    totalGoalsConceded: number;
  }>;
}

interface Tournament {
  id: number;
  name: string;
}

interface ClubLeaderboardClientProps {
  clubs: Club[];
  tournaments: Tournament[];
}

export function ClubLeaderboardClient({ clubs, tournaments }: ClubLeaderboardClientProps) {
  const [selectedTournament, setSelectedTournament] = useState<string>('all');

  // Filter and transform clubs based on selected tournament
  const filteredClubs = selectedTournament === 'all' 
    ? clubs 
    : clubs
        .map((club) => {
          const tournamentId = parseInt(selectedTournament);
          const stats = club.tournamentStats[tournamentId];
          
          if (!stats || stats.totalMatches === 0) {
            return null;
          }

          const goalDifference = stats.totalGoalsScored - stats.totalGoalsConceded;
          const avgPointsPerMatch = stats.totalMatches > 0 
            ? parseFloat((stats.totalPoints / stats.totalMatches).toFixed(2)) 
            : 0;

          return {
            ...club,
            totalPoints: stats.totalPoints,
            totalMatches: stats.totalMatches,
            totalWins: stats.totalWins,
            totalDraws: stats.totalDraws,
            totalLosses: stats.totalLosses,
            totalGoalsScored: stats.totalGoalsScored,
            totalGoalsConceded: stats.totalGoalsConceded,
            goalDifference,
            avgPointsPerMatch,
          };
        })
        .filter((club): club is NonNullable<typeof club> => club !== null)
        .sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.totalGoalsScored - a.totalGoalsScored;
        });

  // Calculate stats for the overview cards
  const totalClubs = filteredClubs.length;
  const totalMatches = filteredClubs.reduce((sum, club) => sum + club.totalMatches, 0);
  const totalPlayers = filteredClubs.reduce((sum, club) => sum + club.playerCount, 0);
  const totalGoals = filteredClubs.reduce((sum, club) => sum + club.totalGoalsScored, 0);

  return (
    <div className="w-full space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{totalClubs}</p>
          <p className="text-sm text-white text-opacity-90">Total Clubs</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{totalMatches}</p>
          <p className="text-sm text-white text-opacity-90">Total Matches</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{totalPlayers}</p>
          <p className="text-sm text-white text-opacity-90">Total Players</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{totalGoals}</p>
          <p className="text-sm text-white text-opacity-90">Total Goals</p>
        </div>
      </div>

      {/* Tournament Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex border-b border-gray-200 min-w-fit">
            <button
              onClick={() => setSelectedTournament('all')}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                selectedTournament === 'all'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overall Stats
            </button>
            {tournaments.map((tournament) => (
              <button
                key={tournament.id}
                onClick={() => setSelectedTournament(tournament.id.toString())}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                  selectedTournament === tournament.id.toString()
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                {tournament.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden -mx-4 sm:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 min-w-[600px]">
            <thead className="bg-gradient-to-r from-gray-50 to-white">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-16">Rank</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[140px]">Club</th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-20">Players</th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-20">Matches</th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-24">W/D/L</th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-20">Goals</th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-16">GD</th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-20">Avg Pts</th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-24">Total Pts</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClubs.map((club, index) => (
                <tr key={club.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {index === 0 && (
                        <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">🥇</span>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-7 h-7 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">🥈</span>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">🥉</span>
                        </div>
                      )}
                      {index > 2 && (
                        <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                    <Link href={`/dashboard/clubs/${club.id}`} className="flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                      {club.logo ? (
                        <img src={club.logo} alt={club.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-emerald-700">{club.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-semibold text-gray-900 text-sm truncate max-w-[100px]">{club.name}</span>
                    </Link>
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">{club.playerCount}</td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">{club.totalMatches}</td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-center text-xs">
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="text-green-600 font-semibold">{club.totalWins}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-yellow-600 font-semibold">{club.totalDraws}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600 font-semibold">{club.totalLosses}</span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">
                    {club.totalGoalsScored} - {club.totalGoalsConceded}
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-center">
                    <span className={`font-semibold text-sm ${
                      club.goalDifference > 0 ? 'text-green-600' : 
                      club.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {club.goalDifference > 0 ? '+' : ''}{club.goalDifference}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {club.avgPointsPerMatch}
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-center">
                    <span className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-xs font-bold shadow-md">
                      {club.totalPoints}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredClubs.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600 mb-6">
            {selectedTournament === 'all' 
              ? 'Create clubs and add tournament results to see the leaderboard.'
              : 'No data available for the selected tournament.'}
          </p>
        </div>
      )}
    </div>
  );
}
