'use client';

import { Modal } from './ui/Modal';

interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  totalPoints: number;
}

interface Player {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
}

interface LeaderboardEntry {
  rank: number;
  player: Player;
  stats: PlayerStats;
}

interface Tournament {
  id: number;
  name: string;
  pointsPerWin: number;
  pointsPerDraw: number;
  pointsPerLoss: number;
  pointsPerGoalScored: number;
  pointsPerGoalConceded: number;
}

interface PlayerStatsModalProps {
  player: LeaderboardEntry;
  tournament: Tournament;
  onClose: () => void;
}

export function PlayerStatsModal({ player, tournament, onClose }: PlayerStatsModalProps) {
  const { stats } = player;

  // Calculate points breakdown
  const pointsFromWins = stats.wins * tournament.pointsPerWin;
  const pointsFromDraws = stats.draws * tournament.pointsPerDraw;
  const pointsFromLosses = stats.losses * tournament.pointsPerLoss;
  const pointsFromGoalsScored = stats.goalsScored * tournament.pointsPerGoalScored;
  const pointsFromGoalsConceded = stats.goalsConceded * tournament.pointsPerGoalConceded;

  const goalDifference = stats.goalsScored - stats.goalsConceded;
  const winRate = stats.matchesPlayed > 0 
    ? ((stats.wins / stats.matchesPlayed) * 100).toFixed(1) 
    : '0.0';
  const avgGoalsPerMatch = stats.matchesPlayed > 0 
    ? (stats.goalsScored / stats.matchesPlayed).toFixed(2) 
    : '0.00';
  const avgPointsPerMatch = stats.matchesPlayed > 0 
    ? (stats.totalPoints / stats.matchesPlayed).toFixed(2) 
    : '0.00';

  return (
    <Modal isOpen={true} onClose={onClose} title={`${player.player.name} - Tournament Statistics`} size="xl">
      <div className="space-y-6">
        {/* Player Info */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
          {player.player.photo ? (
            <img
              src={player.player.photo}
              alt={player.player.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-2xl font-medium">
                {player.player.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{player.player.name}</h3>
            <p className="text-sm text-gray-600">{player.player.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${
                player.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                player.rank === 2 ? 'bg-gray-100 text-gray-800' :
                player.rank === 3 ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                Rank #{player.rank}
              </span>
              <span className="text-2xl font-bold text-gray-900">{stats.totalPoints} pts</span>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Overall Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Matches Played</div>
              <div className="text-2xl font-bold text-gray-900">{stats.matchesPlayed}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Wins</div>
              <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Draws</div>
              <div className="text-2xl font-bold text-blue-600">{stats.draws}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Losses</div>
              <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
            </div>
          </div>
        </div>

        {/* Goal Statistics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Goal Statistics</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Goals Scored</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.goalsScored}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Goals Conceded</div>
              <div className="text-2xl font-bold text-red-600">{stats.goalsConceded}</div>
            </div>
            <div className={`rounded-lg p-3 ${
              goalDifference > 0 ? 'bg-green-50' : 
              goalDifference < 0 ? 'bg-red-50' : 
              'bg-gray-50'
            }`}>
              <div className="text-xs text-gray-600 mb-1">Goal Difference</div>
              <div className={`text-2xl font-bold ${
                goalDifference > 0 ? 'text-green-600' : 
                goalDifference < 0 ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {goalDifference > 0 ? '+' : ''}{goalDifference}
              </div>
            </div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Points Breakdown</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Wins ({stats.wins} × {tournament.pointsPerWin} pts)
              </span>
              <span className="text-sm font-semibold text-gray-900">{pointsFromWins} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Draws ({stats.draws} × {tournament.pointsPerDraw} pts)
              </span>
              <span className="text-sm font-semibold text-gray-900">{pointsFromDraws} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Losses ({stats.losses} × {tournament.pointsPerLoss} pts)
              </span>
              <span className="text-sm font-semibold text-gray-900">{pointsFromLosses} pts</span>
            </div>
            {tournament.pointsPerGoalScored !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Goals Scored ({stats.goalsScored} × {tournament.pointsPerGoalScored} pts)
                </span>
                <span className="text-sm font-semibold text-gray-900">{pointsFromGoalsScored} pts</span>
              </div>
            )}
            {tournament.pointsPerGoalConceded !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Goals Conceded ({stats.goalsConceded} × {tournament.pointsPerGoalConceded} pts)
                </span>
                <span className="text-sm font-semibold text-gray-900">{pointsFromGoalsConceded} pts</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">Total Points</span>
              <span className="text-lg font-bold text-gray-900">{stats.totalPoints} pts</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Performance Metrics</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-purple-600">{winRate}%</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Avg Goals/Match</div>
              <div className="text-2xl font-bold text-indigo-600">{avgGoalsPerMatch}</div>
            </div>
            <div className="bg-cyan-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Avg Points/Match</div>
              <div className="text-2xl font-bold text-cyan-600">{avgPointsPerMatch}</div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}