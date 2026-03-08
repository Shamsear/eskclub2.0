'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface LeaderboardProps {
  tournament: {
    id: number;
    name: string;
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    pointsPerGoalScored: number;
    pointsPerGoalConceded: number;
  };
  stats: Array<{
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
  isLoading?: boolean;
}

export function Leaderboard({ tournament, stats, isLoading = false }: LeaderboardProps) {
  const [showPointSystem, setShowPointSystem] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpansion = (statId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(statId)) {
        newSet.delete(statId);
      } else {
        newSet.add(statId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (stats.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No statistics yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Add match results to see the leaderboard and player rankings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PointSystemDisplay tournament={tournament} isOpen={showPointSystem} onToggle={() => setShowPointSystem(!showPointSystem)} />
      <DesktopLeaderboardTable stats={stats} tournament={tournament} expandedRows={expandedRows} toggleRowExpansion={toggleRowExpansion} />
      <MobileLeaderboardCards stats={stats} />
      <div className="flex justify-end pt-4">
        <ExportButton tournament={tournament} stats={stats} />
      </div>
    </div>
  );
}

// Desktop Table Component
interface DesktopLeaderboardTableProps {
  stats: LeaderboardProps['stats'];
  tournament: LeaderboardProps['tournament'];
  expandedRows: Set<number>;
  toggleRowExpansion: (id: number) => void;
}

function DesktopLeaderboardTable({ stats, tournament, expandedRows, toggleRowExpansion }: DesktopLeaderboardTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Tournament leaderboard">
        <thead className="bg-gradient-to-r from-gray-50 to-white">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Player</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider" abbr="Matches Played">MP</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider" abbr="Wins">W</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider" abbr="Draws">D</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider" abbr="Losses">L</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider" abbr="Goals Scored">GS</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider" abbr="Goals Conceded">GC</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider" abbr="Points">Pts</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stats.map((stat, index) => (
            <React.Fragment key={stat.id}>
              <tr className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all ${index < 3 ? 'bg-gradient-to-r from-yellow-50/30 to-orange-50/30' : ''}`}>
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {stat.player.photo ? (
                      <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                        <Image src={stat.player.photo} alt={stat.player.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">{stat.player.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{stat.player.name}</div>
                      <div className="text-xs text-gray-500">{stat.player.club ? stat.player.club.name : "Free Agent"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{stat.matchesPlayed}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-center font-medium">{stat.wins}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{stat.draws}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-center font-medium">{stat.losses}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{stat.goalsScored}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{stat.goalsConceded}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-bold text-blue-600">{stat.totalPoints}</span>
                    <button
                      onClick={() => toggleRowExpansion(stat.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                      aria-label={expandedRows.has(stat.id) ? "Hide points breakdown" : "Show points breakdown"}
                      aria-expanded={expandedRows.has(stat.id)}
                    >
                      <svg className={`w-4 h-4 transition-transform ${expandedRows.has(stat.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              {expandedRows.has(stat.id) && (
                <tr key={`${stat.id}-breakdown`} className="bg-blue-50">
                  <td colSpan={9} className="px-6 py-4">
                    <PointsBreakdown stat={stat} tournament={tournament} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Points Breakdown Component
interface PointsBreakdownProps {
  stat: {
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    totalPoints: number;
    conditionalPoints?: number;
  };
  tournament: {
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    pointsPerGoalScored: number;
    pointsPerGoalConceded: number;
  };
}

function PointsBreakdown({ stat, tournament }: PointsBreakdownProps) {
  const winPoints = stat.wins * tournament.pointsPerWin;
  const drawPoints = stat.draws * tournament.pointsPerDraw;
  const lossPoints = stat.losses * tournament.pointsPerLoss;
  const goalsScoredPoints = stat.goalsScored * tournament.pointsPerGoalScored;
  const goalsConcededPoints = stat.goalsConceded * tournament.pointsPerGoalConceded;
  const basePoints = winPoints + drawPoints + lossPoints + goalsScoredPoints + goalsConcededPoints;
  const conditionalPoints = stat.conditionalPoints || 0;
  const calculatedTotal = basePoints + conditionalPoints;
  const isValid = calculatedTotal === stat.totalPoints;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Points Breakdown</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-gray-600 mb-2 font-medium">Match Results</p>
          <div className="space-y-1.5">
            {stat.wins > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">{stat.wins} Win{stat.wins !== 1 ? 's' : ''} × {tournament.pointsPerWin} pts</span>
                <span className="font-semibold text-green-600">+{winPoints}</span>
              </div>
            )}
            {stat.draws > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">{stat.draws} Draw{stat.draws !== 1 ? 's' : ''} × {tournament.pointsPerDraw} pts</span>
                <span className="font-semibold text-gray-600">+{drawPoints}</span>
              </div>
            )}
            {stat.losses > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">{stat.losses} Loss{stat.losses !== 1 ? 'es' : ''} × {tournament.pointsPerLoss} pts</span>
                <span className="font-semibold text-red-600">{lossPoints >= 0 ? '+' : ''}{lossPoints}</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-gray-600 mb-2 font-medium">Goals</p>
          <div className="space-y-1.5">
            {stat.goalsScored > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">{stat.goalsScored} Scored × {tournament.pointsPerGoalScored} pts</span>
                <span className="font-semibold text-blue-600">{goalsScoredPoints >= 0 ? '+' : ''}{goalsScoredPoints}</span>
              </div>
            )}
            {stat.goalsConceded > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">{stat.goalsConceded} Conceded × {tournament.pointsPerGoalConceded} pts</span>
                <span className="font-semibold text-orange-600">{goalsConcededPoints >= 0 ? '+' : ''}{goalsConcededPoints}</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-gray-600 mb-2 font-medium">Bonus/Penalties</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-700">Conditional Rules</span>
              <span className={`font-semibold ${conditionalPoints > 0 ? 'text-purple-600' : conditionalPoints < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {conditionalPoints >= 0 ? '+' : ''}{conditionalPoints}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 border-2 border-blue-300 mt-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Points</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Base: {basePoints} + Conditional: {conditionalPoints}</span>
              {!isValid && <span className="text-xs text-red-600 font-medium" title="Calculation mismatch detected">⚠️ Mismatch</span>}
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">{stat.totalPoints}</span>
            <p className="text-xs text-gray-500">points</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Point System Display Component
interface PointSystemDisplayProps {
  tournament: {
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    pointsPerGoalScored: number;
    pointsPerGoalConceded: number;
  };
  isOpen: boolean;
  onToggle: () => void;
}

function PointSystemDisplay({ tournament, isOpen, onToggle }: PointSystemDisplayProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl overflow-hidden shadow-sm">
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-100/50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500" aria-expanded={isOpen} aria-controls="point-system-details" aria-label={`${isOpen ? 'Hide' : 'Show'} point system configuration`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-blue-900 block">Point System Configuration</span>
            <span className="text-xs text-blue-700">Click to {isOpen ? 'hide' : 'view'} scoring rules</span>
          </div>
        </div>
        <svg className={`w-5 h-5 text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-2" id="point-system-details" role="region" aria-label="Point system details">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">Win</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{tournament.pointsPerWin}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">Draw</p>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{tournament.pointsPerDraw}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-red-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">Loss</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{tournament.pointsPerLoss}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">Goal Scored</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{tournament.pointsPerGoalScored}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">Goal Conceded</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">{tournament.pointsPerGoalConceded}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile Cards Component
interface MobileLeaderboardCardsProps {
  stats: LeaderboardProps['stats'];
}

function MobileLeaderboardCards({ stats }: MobileLeaderboardCardsProps) {
  return (
    <div className="md:hidden space-y-3">
      {stats.map((stat, index) => (
        <div key={stat.id} className={`bg-white border-2 rounded-xl p-4 shadow-md hover:shadow-lg transition-all ${
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
              {stat.player.photo ? (
                <div className="relative h-14 w-14 rounded-xl overflow-hidden ring-2 ring-gray-100">
                  <Image src={stat.player.photo} alt={stat.player.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center ring-2 ring-gray-100">
                  <span className="text-xl font-bold text-blue-700">{stat.player.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">{stat.player.name}</h3>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {stat.player.club ? stat.player.club.name : "Free Agent"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stat.totalPoints}</div>
              <div className="text-xs text-gray-500 font-medium">points</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-200">
            <div className="text-center bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-1 font-medium">MP</div>
              <div className="text-sm font-bold text-gray-900">{stat.matchesPlayed}</div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-1 font-medium">W/D/L</div>
              <div className="text-xs font-bold text-gray-900">{stat.wins}/{stat.draws}/{stat.losses}</div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-1 font-medium">GS</div>
              <div className="text-sm font-bold text-gray-900">{stat.goalsScored}</div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-1 font-medium">GC</div>
              <div className="text-sm font-bold text-gray-900">{stat.goalsConceded}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Loading Skeleton Component
function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-100 rounded-lg h-16 animate-pulse" />
      <div className="hidden md:block overflow-x-auto">
        <div className="bg-gray-50 rounded-t-lg h-12 animate-pulse mb-2" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border-b border-gray-200 h-16 animate-pulse" />
        ))}
      </div>
      <div className="md:hidden space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 h-32 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Export Button Component
interface ExportButtonProps {
  tournament: { id: number; name: string; };
  stats: Array<{
    player: { name: string; club: { name: string; } | null; };
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    totalPoints: number;
  }>;
}

function ExportButton({ tournament, stats }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['Rank', 'Player', 'Club', 'Matches Played', 'Wins', 'Draws', 'Losses', 'Goals Scored', 'Goals Conceded', 'Total Points'];
      const rows = stats.map((stat, index) => [
        index + 1, stat.player.name, stat.player.club ? stat.player.club.name : "Free Agent", stat.matchesPlayed,
        stat.wins, stat.draws, stat.losses, stat.goalsScored, stat.goalsConceded, stat.totalPoints,
      ]);
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${tournament.name.replace(/\s+/g, '_')}_leaderboard.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button onClick={exportToCSV} disabled={isExporting || stats.length === 0} className="inline-flex items-center px-4 py-2 min-h-[44px] bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-md active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" aria-label={isExporting ? "Exporting leaderboard data" : "Export leaderboard to CSV"}>
      {isExporting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </>
      )}
    </button>
  );
}
