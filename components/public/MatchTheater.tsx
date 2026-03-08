'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface MatchTheaterData {
  match: {
    id: number;
    date: string;
    stageName: string | null;
    tournament: {
      id: number;
      name: string;
    };
    isTeamMatch?: boolean;
  };
  results: Array<{
    player: {
      id: number;
      name: string;
      photo: string | null;
      club: {
        id: number;
        name: string;
        logo: string | null;
      };
    };
    outcome: 'WIN' | 'DRAW' | 'LOSS';
    goalsScored: number;
    goalsConceded: number;
    pointsEarned: number;
    basePoints: number;
    conditionalPoints: number;
  }>;
  teamResults?: Array<{
    team: {
      clubId: number;
      clubName: string;
      clubLogo: string | null;
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
    };
    outcome: 'WIN' | 'DRAW' | 'LOSS';
    goalsScored: number;
    goalsConceded: number;
    pointsEarned: number;
    basePoints: number;
    conditionalPoints: number;
  }>;
}

interface MatchTheaterProps {
  data: MatchTheaterData;
}

const outcomeConfig = {
  WIN: {
    label: 'Victory',
    icon: '🏆',
    bgGradient: 'from-green-600 to-emerald-700',
    textColor: 'text-green-400',
    borderColor: 'border-green-500',
  },
  DRAW: {
    label: 'Draw',
    icon: '🤝',
    bgGradient: 'from-yellow-600 to-amber-700',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500',
  },
  LOSS: {
    label: 'Defeat',
    icon: '⚔️',
    bgGradient: 'from-red-700 to-rose-800',
    textColor: 'text-red-400',
    borderColor: 'border-red-600',
  },
};

export function MatchTheater({ data }: MatchTheaterProps) {
  const matchDate = new Date(data.match.date);
  const isTeamMatch = data.match.isTeamMatch && data.teamResults && data.teamResults.length > 0;

  // Calculate stats based on match type
  const totalPlayers = isTeamMatch ? data.teamResults!.length * 2 : data.results.length;
  const totalGoals = isTeamMatch
    ? data.teamResults!.reduce((sum, r) => sum + r.goalsScored, 0)
    : data.results.reduce((sum, r) => sum + r.goalsScored, 0);
  const winners = isTeamMatch
    ? data.teamResults!.filter((r) => r.outcome === 'WIN').length
    : data.results.filter((r) => r.outcome === 'WIN').length;
  const totalPoints = isTeamMatch
    ? data.teamResults!.reduce((sum, r) => sum + r.pointsEarned, 0)
    : data.results.reduce((sum, r) => sum + r.pointsEarned, 0);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Hero */}
      <div className="relative overflow-hidden py-12 sm:py-16" style={{ background: "linear-gradient(180deg,#0D0D0D 0%,#110800 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,183,0,0.12) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#FF6600,transparent)" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-60" />

        {/* Breadcrumb */}
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-[#555]">
            <li><Link href="/matches" className="hover:text-[#FFB700] transition-colors">Matches</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li><Link href={`/tournaments/${data.match.tournament.id}`} className="hover:text-[#FFB700] transition-colors">{data.match.tournament.name}</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li className="text-[#FFB700] font-semibold">Match #{data.match.id}</li>
          </ol>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border border-[#FFB700]/25 text-xs font-bold tracking-widest uppercase text-[#FFB700]" style={{ background: "rgba(255,183,0,0.08)" }}>
            {isTeamMatch ? '👥 Doubles Match' : '⚽ Match Details'}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 font-['Outfit',sans-serif]">
            <span style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {isTeamMatch ? 'Doubles Match' : 'Match Details'}
            </span>
          </h1>
          <p className="text-[#707070] text-sm mb-5">{data.match.tournament.name}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1E1E1E] text-sm" style={{ background: '#111' }}>
              <svg className="w-4 h-4 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time dateTime={data.match.date} className="text-[#A0A0A0] text-xs">
                {matchDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
            {data.match.stageName && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1E1E1E] text-sm" style={{ background: '#111' }}>
                <svg className="w-4 h-4 text-[#FFB700]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l7 3.5v8.32c0 4.27-2.94 8.27-7 9.27-4.06-1-7-5-7-9.27V7.68l7-3.5z" />
                </svg>
                <span className="text-[#A0A0A0] text-xs">{data.match.stageName}</span>
              </div>
            )}
            {isTeamMatch && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold" style={{ background: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.3)', color: '#A78BFA' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                2v2 Format
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Players', value: totalPlayers, color: '#FF6600', emoji: '👥' },
            { label: 'Total Goals', value: totalGoals, color: '#FFB700', emoji: '⚽' },
            { label: isTeamMatch ? 'Winning Teams' : 'Winners', value: winners, color: '#22C55E', emoji: '🏆' },
            { label: 'Total Points', value: totalPoints, color: '#CC2900', emoji: '⭐' },
          ].map(({ label, value, color, emoji }) => (
            <div key={label} className="rounded-2xl border border-[#1E1E1E] p-5 text-center hover:-translate-y-1 transition-all duration-300" style={{ background: '#111' }}>
              <div className="text-xs text-[#555] font-medium uppercase tracking-widest mb-2">{label}</div>
              {emoji ? <div className="text-3xl mb-2">{emoji}</div> : null}
              <div className="text-3xl font-black" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg,#FF6600,#CC2900)" }} />
          <h2 className="text-2xl font-black text-white font-['Outfit',sans-serif]">
            {isTeamMatch ? 'Team Performances' : 'Player Performances'}
          </h2>
        </div>

        {isTeamMatch ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.teamResults!.map((teamResult, index) => (
              <TeamPerformanceCard
                key={index}
                teamResult={teamResult}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.results.map((result) => (
              <PlayerPerformanceCard
                key={result.player.id}
                result={result}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PlayerPerformanceCardProps {
  result: MatchTheaterData['results'][0];
}

function PlayerPerformanceCard({ result }: PlayerPerformanceCardProps) {
  const config = outcomeConfig[result.outcome];
  const goalDiff = result.goalsScored - result.goalsConceded;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] hover:border-[#FF6600]/40 transition-all duration-300 overflow-hidden group" style={{ background: '#111' }}>
      {/* Outcome Banner */}
      <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <span className="text-white font-black text-base">{config.label}</span>
        </div>
        <div className="text-xl font-black text-white">{result.pointsEarned} pts</div>
      </div>

      <div className="p-5">
        {/* Player Info */}
        <Link href={`/players/${result.player.id}`} className="block group/player mb-5">
          <div className="flex items-center gap-4">
            {result.player.photo ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#FF6600]/50 flex-shrink-0">
                <OptimizedImage src={result.player.photo} alt={result.player.name} width={56} height={56} className="w-full h-full object-cover group-hover/player:scale-110 transition-transform duration-300" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>
                <span className="text-xl font-black text-white">{result.player.name.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-white group-hover/player:text-[#FFB700] transition-colors truncate">{result.player.name}</h3>
              <div className="flex items-center gap-2 text-xs text-[#555]">
                {result.player.club?.logo && <OptimizedImage src={result.player.club.logo} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />}
                <span className="truncate">{result.player.club?.name || 'Free Agent'}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          {[
            { label: 'Goals Scored', value: result.goalsScored, color: '#FF6600' },
            { label: 'Goals Conceded', value: result.goalsConceded, color: '#CC2900' },
            { label: 'Goal Diff', value: `${goalDiff > 0 ? '+' : ''}${goalDiff}`, color: goalDiff > 0 ? '#22C55E' : goalDiff < 0 ? '#EF4444' : '#707070' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A]">
              <span className="text-xs text-[#555] font-medium">{label}</span>
              <span className="text-lg font-black" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Points Breakdown */}
        {(result.basePoints > 0 || result.conditionalPoints > 0) && (
          <div className="pt-3 border-t border-[#1A1A1A]">
            <div className="text-xs font-bold text-[#333] uppercase mb-2 tracking-widest">Points Breakdown</div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#555]">Base Points</span>
                <span className="font-bold text-white text-sm">{result.basePoints}</span>
              </div>
              {result.conditionalPoints > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#555]">Bonus Points</span>
                  <span className="font-bold text-green-400 text-sm">+{result.conditionalPoints}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}

type TeamResultItem = NonNullable<MatchTheaterData['teamResults']>[number];

interface TeamPerformanceCardProps {
  teamResult: TeamResultItem;
}

function TeamPerformanceCard({ teamResult }: TeamPerformanceCardProps) {
  const config = outcomeConfig[teamResult.outcome];
  const goalDiff = teamResult.goalsScored - teamResult.goalsConceded;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] hover:border-[rgba(167,139,250,0.4)] transition-all duration-300 overflow-hidden group" style={{ background: '#111' }}>
      {/* Outcome Banner */}
      <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <span className="text-white font-black text-base">{config.label}</span>
        </div>
        <div className="text-xl font-black text-white">{teamResult.pointsEarned} pts</div>
      </div>

      <div className="p-5">
        {/* Club Info */}
        {teamResult.team.clubLogo && (
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1A1A1A]">
            <OptimizedImage src={teamResult.team.clubLogo} alt={teamResult.team.clubName} width={40} height={40} className="w-10 h-10 object-contain" />
            <h3 className="text-lg font-black text-white">{teamResult.team.clubName}</h3>
          </div>
        )}

        {/* Team Players */}
        <div className="space-y-2 mb-5">
          <div className="text-xs font-bold text-[#333] uppercase tracking-widest mb-2">Team Members</div>
          {[teamResult.team.playerA, teamResult.team.playerB].filter(Boolean).map((p, i) => p && (
            <Link key={i} href={`/players/${p.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1A1A1A] transition-colors group/player">
              {p.photo ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-[rgba(167,139,250,0.3)] flex-shrink-0">
                  <OptimizedImage src={p.photo} alt={p.name} width={40} height={40} className="w-full h-full object-cover group-hover/player:scale-110 transition-transform duration-300" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#A78BFA,#7C3AED)" }}>
                  <span className="text-base font-black text-white">{p.name.charAt(0)}</span>
                </div>
              )}
              <span className="text-sm font-semibold text-[#A0A0A0] group-hover/player:text-[#A78BFA] transition-colors">{p.name}</span>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          {[
            { label: 'Goals Scored', value: teamResult.goalsScored, color: '#FF6600' },
            { label: 'Goals Conceded', value: teamResult.goalsConceded, color: '#CC2900' },
            { label: 'Goal Diff', value: `${goalDiff > 0 ? '+' : ''}${goalDiff}`, color: goalDiff > 0 ? '#22C55E' : goalDiff < 0 ? '#EF4444' : '#707070' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A]">
              <span className="text-xs text-[#555] font-medium">{label}</span>
              <span className="text-lg font-black" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Points Breakdown */}
        {(teamResult.basePoints > 0 || teamResult.conditionalPoints > 0) && (
          <div className="pt-3 border-t border-[#1A1A1A]">
            <div className="text-xs font-bold text-[#333] uppercase mb-2 tracking-widest">Points Breakdown</div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#555]">Base Points</span>
                <span className="font-bold text-white text-sm">{teamResult.basePoints}</span>
              </div>
              {teamResult.conditionalPoints > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#555]">Bonus Points</span>
                  <span className="font-bold text-green-400 text-sm">+{teamResult.conditionalPoints}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}
