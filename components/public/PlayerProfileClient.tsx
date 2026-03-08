'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicCard, CardHeader, CardTitle, CardContent } from './PublicCard';
import { RoleBadge, Badge } from './Badge';
import { StatCard } from './StatCard';
import PerformanceHeatmap from './PerformanceHeatmap';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface PlayerProfileData {
  player: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    place: string | null;
    dateOfBirth: string | null;
    photo: string | null;
    club: {
      id: number;
      name: string;
      logo: string | null;
    };
    roles: Array<'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER'>;
  };
  stats: {
    totalTournaments: number;
    totalMatches: number;
    totalWins: number;
    totalDraws: number;
    totalLosses: number;
    totalGoalsScored: number;
    totalGoalsConceded: number;
    totalPoints: number;
    winRate: number;
  };
  recentMatches: Array<{
    id: number;
    matchId: number;
    date: string;
    tournament: {
      id: number;
      name: string;
    };
    stageName: string | null;
    outcome: 'WIN' | 'DRAW' | 'LOSS';
    goalsScored: number;
    goalsConceded: number;
    pointsEarned: number;
    isTeamMatch?: boolean;
    opponent?: {
      id: number;
      name: string;
      photo: string | null;
      goalsScored: number;
      goalsConceded: number;
    } | null;
    partner?: {
      id: number;
      name: string;
      photo: string | null;
    };
    club?: {
      id: number;
      name: string;
      logo: string | null;
    } | null;
    opponentTeam?: {
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
      goalsScored: number;
    } | null;
  }>;
  tournaments: Array<{
    id: number;
    name: string;
    startDate: string;
    rank: number | null;
    totalPoints: number;
  }>;
}

interface PlayerProfileClientProps {
  initialData: PlayerProfileData;
}

export default function PlayerProfileClient({ initialData }: PlayerProfileClientProps) {
  const router = useRouter();
  const { player, stats, recentMatches, tournaments } = initialData;

  const outcomeConfig = {
    WIN: {
      color: 'bg-green-50 text-green-700 border-green-200',
      bgGradient: 'from-green-500 to-emerald-600',
      icon: '✓',
      label: 'Win',
    },
    DRAW: {
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      bgGradient: 'from-yellow-500 to-amber-600',
      icon: '=',
      label: 'Draw',
    },
    LOSS: {
      color: 'bg-red-50 text-red-700 border-red-200',
      bgGradient: 'from-red-500 to-rose-600',
      icon: '✗',
      label: 'Loss',
    },
  };

  const goalDifference = stats.totalGoalsScored - stats.totalGoalsConceded;

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      {/* Hero Section with Player Info */}
      <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Orange Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/20 via-transparent to-[#CC2900]/20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Player Photo */}
            <div className="flex-shrink-0">
              {player.photo ? (
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl border-4 border-[#FF6600] overflow-hidden shadow-2xl bg-white transform hover:scale-105 transition-transform duration-300">
                  <OptimizedImage
                    src={player.photo}
                    alt={player.name}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-br from-[#FF6600] to-[#CC2900] border-4 border-[#FFB700] flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <span className="text-7xl sm:text-8xl font-bold text-white">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
                {player.name}
              </h1>

              {/* Roles */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                {player.roles.map((role) => (
                  <RoleBadge key={role} role={role} size="md" />
                ))}
              </div>

              {/* Contact & Location */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                {player.place && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <svg className="w-5 h-5 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-white/90">{player.place}</span>
                  </div>
                )}
                {player.phone && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <svg className="w-5 h-5 text-[#FFB700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-white/90">{player.phone}</span>
                  </div>
                )}
              </div>

              {/* Club Badge */}
              {player.club ? (
                <div
                  onClick={() => router.push(`/clubs/${player.club.id}`)}
                  className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                >
                  {player.club.logo ? (
                    <div className="w-12 h-12 rounded-lg border-2 border-[#FF6600] overflow-hidden bg-white">
                      <OptimizedImage
                        src={player.club.logo}
                        alt={player.club.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF6600] to-[#CC2900] flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {player.club.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-xs text-white/70">Playing for</div>
                    <div className="font-bold text-white group-hover:text-[#FFB700] transition-colors">{player.club.name}</div>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">F</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-white/70">Status</div>
                    <div className="font-bold text-white">Free Agent</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tournaments', value: stats.totalTournaments, color: '#FF6600', icon: <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" /></svg>, bg: '#FF6600' },
            { label: 'Matches', value: stats.totalMatches, color: '#FFB700', icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>, bg: '#FFB700' },
            { label: 'Total Points', value: stats.totalPoints, color: '#CC2900', icon: <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" /></svg>, bg: '#CC2900' },
            { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, color: '#FF6600', icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bg: '#FF6600' },
          ].map(({ label, value, color, icon, bg }) => (
            <div key={label} className="rounded-2xl border border-[#1E1E1E] p-5 text-center hover:-translate-y-1 transition-all duration-300" style={{ background: '#111' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `linear-gradient(135deg,${bg},${bg}99)` }}>{icon}</div>
              <div className="text-2xl font-black mb-1" style={{ color }}>{value}</div>
              <div className="text-xs text-[#555] font-medium uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg,#FF6600,#CC2900)" }} />
          <h2 className="text-2xl font-black text-white font-['Outfit',sans-serif]">Performance Statistics</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {[
            { label: 'Wins', value: stats.totalWins, color: '#22C55E' },
            { label: 'Draws', value: stats.totalDraws, color: '#EAB308' },
            { label: 'Losses', value: stats.totalLosses, color: '#EF4444' },
            { label: 'Goals Scored', value: stats.totalGoalsScored, color: '#FF6600' },
            { label: 'Goals Conceded', value: stats.totalGoalsConceded, color: '#CC2900' },
            { label: 'Goal Diff', value: `${goalDifference > 0 ? '+' : ''}${goalDifference}`, color: goalDifference >= 0 ? '#22C55E' : '#EF4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-[#1E1E1E] p-5 text-center hover:shadow-lg transition-shadow" style={{ background: '#111' }}>
              <div className="text-3xl font-black mb-2" style={{ color }}>{value}</div>
              <div className="text-xs text-[#555] font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Performance Heatmap */}
        <div className="rounded-2xl border border-[#1E1E1E] p-6 sm:p-8 mb-10" style={{ background: '#111' }}>
          <div className="mb-5">
            <h3 className="text-xl font-black text-white mb-1">Performance Heatmap</h3>
            <p className="text-xs text-[#555]">Visual representation of recent performance</p>
          </div>
          <PerformanceHeatmap matches={recentMatches} />
        </div>

        {/* Match History Timeline */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg,#FF6600,#CC2900)" }} />
            <h2 className="text-2xl font-black text-white font-['Outfit',sans-serif]">Recent Match History</h2>
          </div>
        </div>

        {recentMatches.length > 0 ? (
          <div className="grid gap-3 mb-10">
            {recentMatches.map((match) => {
              const config = outcomeConfig[match.outcome];
              const isTeamMatch = match.isTeamMatch;
              
              return (
                <div key={match.id} className="rounded-2xl border border-[#1E1E1E] hover:border-[#FF6600]/40 transition-all duration-300 overflow-hidden group" style={{ background: '#111' }}>
                  <Link href={`/matches/${match.matchId}`} className="block">
                    <div className="flex flex-col p-5">
                      {/* Tournament & Date */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${config.color}`}>{config.label}</span>
                          {isTeamMatch && <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold">2v2</span>}
                          {match.stageName && <span className="text-xs text-[#555]">{match.stageName}</span>}
                        </div>
                        <div className="text-xs text-[#555]">{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>

                      {isTeamMatch ? (
                        /* Team Match Display */
                        <div className="flex flex-col gap-3 mb-3">
                          {/* Your Team */}
                          <div className="flex flex-col gap-2">
                            {match.club && (
                              <div className="flex items-center gap-2 justify-center">
                                {match.club.logo && <img src={match.club.logo} alt={match.club.name} className="w-5 h-5 object-contain" />}
                                <span className="text-xs font-bold text-white/70">Your Team: {match.club.name}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-center gap-4">
                              <div className="flex items-center gap-2">
                                {player.photo ? (
                                  <img src={player.photo} alt={player.name} className="w-10 h-10 rounded-full object-cover border border-[#FF6600]/50 flex-shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>
                                    <span className="text-base font-bold text-white">{player.name.charAt(0)}</span>
                                  </div>
                                )}
                                <div className="text-left">
                                  <div className="font-bold text-sm text-white">{player.name}</div>
                                  <div className="text-xs text-[#555]">You</div>
                                </div>
                              </div>

                              <div className="text-xs text-[#555]">&</div>

                              {match.partner && (
                                <div className="flex items-center gap-2">
                                  {match.partner.photo ? (
                                    <img src={match.partner.photo} alt={match.partner.name} className="w-10 h-10 rounded-full object-cover border border-purple-500/50 flex-shrink-0" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                      <span className="text-base font-bold text-purple-300">{match.partner.name.charAt(0)}</span>
                                    </div>
                                  )}
                                  <div className="text-left">
                                    <div className="font-bold text-sm text-white">{match.partner.name}</div>
                                    <div className="text-xs text-[#555]">Partner</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Score */}
                          <div className="flex items-center justify-center gap-4 px-6">
                            <div className="text-3xl font-bold text-[#FF6600]">{match.goalsScored}</div>
                            <div className="text-2xl font-bold text-gray-400">-</div>
                            <div className="text-3xl font-bold text-[#CC2900]">{match.goalsConceded}</div>
                          </div>

                          {/* Opponent Team */}
                          {match.opponentTeam && (
                            <div className="flex flex-col gap-2 pt-2 border-t border-[#1A1A1A]">
                              {match.opponentTeam.club && (
                                <div className="flex items-center gap-2 justify-center">
                                  {match.opponentTeam.club.logo && <img src={match.opponentTeam.club.logo} alt={match.opponentTeam.club.name} className="w-5 h-5 object-contain" />}
                                  <span className="text-xs font-bold text-white/70">Opponent: {match.opponentTeam.club.name}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-center gap-4">
                                <div className="flex items-center gap-2">
                                  {match.opponentTeam.playerA.photo ? (
                                    <img src={match.opponentTeam.playerA.photo} alt={match.opponentTeam.playerA.name} className="w-8 h-8 rounded-full object-cover border border-[#333] flex-shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs font-bold text-[#555]">{match.opponentTeam.playerA.name.charAt(0)}</span>
                                    </div>
                                  )}
                                  <div className="text-left">
                                    <div className="text-xs text-white">{match.opponentTeam.playerA.name}</div>
                                  </div>
                                </div>

                                <div className="text-xs text-[#555]">&</div>

                                <div className="flex items-center gap-2">
                                  {match.opponentTeam.playerB.photo ? (
                                    <img src={match.opponentTeam.playerB.photo} alt={match.opponentTeam.playerB.name} className="w-8 h-8 rounded-full object-cover border border-[#333] flex-shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs font-bold text-[#555]">{match.opponentTeam.playerB.name.charAt(0)}</span>
                                    </div>
                                  )}
                                  <div className="text-left">
                                    <div className="text-xs text-white">{match.opponentTeam.playerB.name}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Singles Match Display */
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
                          {/* Current Player */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
                            {player.photo ? (
                              <img src={player.photo} alt={player.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-[#FF6600]/50 flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>
                                <span className="text-base sm:text-lg font-bold text-white">{player.name.charAt(0)}</span>
                              </div>
                            )}
                            <div className="text-left min-w-0 flex-1">
                              <div className="font-bold text-sm sm:text-base text-white truncate group-hover:text-[#FFB700] transition-colors">{player.name}</div>
                              <div className="text-xs text-[#555] truncate">{player.club?.name || 'Free Agent'}</div>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 flex-shrink-0">
                            <div className="text-2xl sm:text-3xl font-bold text-[#FF6600]">{match.goalsScored}</div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-400">-</div>
                            <div className="text-2xl sm:text-3xl font-bold text-[#CC2900]">{match.goalsConceded}</div>
                          </div>

                          {/* Opponent */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end w-full sm:w-auto">
                            <div className="text-right min-w-0 flex-1">
                              <div className="font-bold text-sm sm:text-base text-white truncate">{match.opponent?.name || 'Walkover'}</div>
                              <div className="text-xs text-[#555] truncate">Opponent</div>
                            </div>
                            {match.opponent?.photo ? (
                              <img src={match.opponent.photo} alt={match.opponent.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-[#333] flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                                <span className="text-base sm:text-lg font-bold text-[#555]">{match.opponent?.name.charAt(0) || '?'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tournament Name */}
                      <div className="text-xs text-[#555] text-center pt-3 border-t border-[#1A1A1A]">
                        <span className="block sm:inline">{match.tournament.name}</span>
                        <span className="hidden sm:inline"> • </span>
                        <span className="block sm:inline mt-1 sm:mt-0">{match.pointsEarned} points earned</span>
                      </div>
                    </div>
                  </Link>

                  {/* Hover bar */}
                  <div className="h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#1E1E1E] text-center py-16 mb-10" style={{ background: '#111' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,102,0,0.08)' }}>
              <svg className="w-10 h-10 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2">No Match History</h3>
            <p className="text-sm text-[#555]">No recent matches to display</p>
          </div>
        )}

        {/* Tournament Participation */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg,#FF6600,#CC2900)" }} />
            <h2 className="text-2xl font-black text-white font-['Outfit',sans-serif]">Tournament Participation</h2>
          </div>
        </div>

        {tournaments.length > 0 ? (
          <div className="grid gap-3">
            {tournaments.map((tournament) => (
              <div key={tournament.id} onClick={() => router.push(`/tournaments/${tournament.id}`)}
                className="rounded-2xl border border-[#1E1E1E] hover:border-[#FF6600]/40 transition-all duration-300 overflow-hidden cursor-pointer group" style={{ background: '#111' }}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5">
                  <div className="flex-1 text-center sm:text-left">
                    <div className="font-black text-base text-white mb-1.5 group-hover:text-[#FFB700] transition-colors">{tournament.name}</div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#555]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(tournament.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {tournament.rank && (
                      <div className="text-white px-5 py-2.5 rounded-xl shadow-lg" style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)" }}>
                        <div className="text-xs font-medium mb-0.5">Rank</div>
                        <div className="text-xl font-black">#{tournament.rank}</div>
                      </div>
                    )}
                    <div className="text-center text-white px-5 py-2.5 rounded-xl shadow-lg" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>
                      <div className="text-xs font-medium mb-0.5">Points</div>
                      <div className="text-xl font-black">{tournament.totalPoints}</div>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#1E1E1E] text-center py-16" style={{ background: '#111' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,102,0,0.08)' }}>
              <svg className="w-10 h-10 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" /></svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2">No Tournament Participation</h3>
            <p className="text-sm text-[#555]">This player hasn\'t participated in any tournaments yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
