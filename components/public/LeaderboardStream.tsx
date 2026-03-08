'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RankAnimation, StaggerContainer, StaggerItem, AnimatedCounter } from '@/lib/animations';

interface Player {
  id: number;
  name: string;
  photo: string | null;
  club: { id: number; name: string; logo: string | null } | null;
}

interface Team {
  clubId: number;
  clubName: string;
  clubLogo: string | null;
  playerA: { id: number; name: string; photo: string | null } | null;
  playerB: { id: number; name: string; photo: string | null } | null;
}

interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  totalPoints: number;
}

interface LeaderboardEntry {
  rank: number;
  isTeam?: boolean;
  team?: Team | null;
  player: Player | null;
  stats: PlayerStats;
}

interface LeaderboardStreamProps {
  tournament: { id: number; name: string };
  rankings: LeaderboardEntry[];
}

/* ─── Rank Badge ─── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl border-2 border-yellow-500/40" style={{ background: 'rgba(251,191,36,0.15)' }}>🥇</div>;
  if (rank === 2) return <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl border-2 border-slate-400/40" style={{ background: 'rgba(148,163,184,0.15)' }}>🥈</div>;
  if (rank === 3) return <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl border-2 border-orange-500/40" style={{ background: 'rgba(251,146,60,0.15)' }}>🥉</div>;
  return (
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm border border-[#333] text-[#555]" style={{ background: '#1A1A1A' }}>
      #{rank}
    </div>
  );
}

/* ─── Stat column ─── */
function StatDisplay({ label, value, highlight }: { label: string; value: number | string; highlight?: string }) {
  return (
    <div className="text-center min-w-[52px]">
      <div className="text-[10px] text-[#444] mb-1 uppercase tracking-widest font-medium">{label}</div>
      <div className={`text-sm sm:text-base font-black ${highlight ?? 'text-white'}`}>{value}</div>
    </div>
  );
}

/* ─── Expanded mini stat card ─── */
function MiniStat({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl border border-[#1E1E1E] p-3 text-center" style={{ background: '#0D0D0D' }}>
      <div className="text-[10px] text-[#444] mb-1 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-black ${color}`}>{value}</div>
    </div>
  );
}

/* ─── Single Row ─── */
function LeaderboardRow({ entry, isExpanded, onToggle }: {
  entry: LeaderboardEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { rank, isTeam, team, player, stats } = entry;
  const topThree = rank <= 3;

  /* ── TEAM ROW ── */
  if (isTeam && team) {
    return (
      <div
        className={`rounded-2xl border overflow-hidden transition-all duration-300 ${topThree ? 'border-[#FF6600]/30' : 'border-[#1E1E1E]'} hover:border-[#FF6600]/40`}
        style={{ background: topThree ? 'linear-gradient(135deg,#130800,#111)' : '#111' }}
      >
        <button
          onClick={onToggle}
          className="w-full min-h-[56px] p-4 flex items-center gap-3 sm:gap-4 text-left hover:bg-white/[0.02] transition-colors focus:outline-none"
          aria-expanded={isExpanded}
        >
          <RankBadge rank={rank} />

          {/* Team Info */}
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-1">
              {team.clubLogo && <img src={team.clubLogo} alt={team.clubName} className="w-5 h-5 object-contain" />}
              <div className="font-black text-white text-sm sm:text-base truncate">{team.clubName}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#555]">
              {[team.playerA, team.playerB].filter(Boolean).map((p, i) => p && (
                <span key={i} className="flex items-center gap-1">
                  {p.photo
                    ? <img src={p.photo} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                    : <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ background: 'linear-gradient(135deg,#A78BFA,#7C3AED)' }}>{p.name.charAt(0)}</div>
                  }
                  {p.name}
                  {i === 0 && <span className="text-[#333]">&amp;</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Key Stats */}
          <div className="hidden md:flex items-center gap-3 lg:gap-5 flex-shrink-0">
            <StatDisplay label="MP" value={stats.matchesPlayed} />
            <StatDisplay label="W" value={stats.wins} highlight="text-green-400" />
            <StatDisplay label="D" value={stats.draws} highlight="text-[#555]" />
            <StatDisplay label="L" value={stats.losses} highlight="text-red-400" />
            <StatDisplay label="GD" value={stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference} highlight={stats.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'} />
          </div>

          {/* Points pill */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="px-3 py-1.5 rounded-full text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
              <AnimatedCounter value={stats.totalPoints} format={(v) => `${Math.round(v)} pts`} />
            </div>
            <svg className={`w-4 h-4 text-[#333] transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 pt-3 border-t border-[#1A1A1A]">
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 mb-4">
              <MiniStat label="Matches" value={stats.matchesPlayed} color="text-white" />
              <MiniStat label="Wins" value={stats.wins} color="text-green-400" />
              <MiniStat label="Draws" value={stats.draws} color="text-[#555]" />
              <MiniStat label="Losses" value={stats.losses} color="text-red-400" />
              <MiniStat label="Goals Scored" value={stats.goalsScored} color="text-[#FF6600]" />
              <MiniStat label="Goals Conceded" value={stats.goalsConceded} color="text-[#CC2900]" />
              <MiniStat label="Goal Diff" value={stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference} color={stats.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'} />
              <MiniStat label="Points" value={stats.totalPoints} color="text-[#FFB700]" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-[#555] mb-2">
                <span>Win Rate</span>
                <span className="font-bold text-white">{stats.matchesPlayed > 0 ? `${((stats.wins / stats.matchesPlayed) * 100).toFixed(1)}%` : '0%'}</span>
              </div>
              <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: '#1A1A1A' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: stats.matchesPlayed > 0 ? `${(stats.wins / stats.matchesPlayed) * 100}%` : '0%', background: 'linear-gradient(90deg,#FF6600,#FFB700)' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── SINGLES ROW ── */
  if (!player) return null;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${topThree ? 'border-[#FF6600]/30' : 'border-[#1E1E1E]'} hover:border-[#FF6600]/40`}
      style={{ background: topThree ? 'linear-gradient(135deg,#130800,#111)' : '#111' }}
    >
      <button
        onClick={onToggle}
        className="w-full min-h-[56px] p-4 flex items-center gap-3 sm:gap-4 text-left hover:bg-white/[0.02] transition-colors focus:outline-none"
        aria-expanded={isExpanded}
        aria-label={`${player.name} - Rank ${rank}, ${stats.totalPoints} points`}
      >
        <RankBadge rank={rank} />

        {/* Photo */}
        <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden flex-shrink-0 border border-[#FF6600]/30" style={{ minWidth: '44px', minHeight: '44px' }}>
          {player.photo ? (
            <Image src={player.photo} alt={player.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-white text-lg" style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
              {player.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0 mr-2">
          <Link
            href={`/players/${player.id}`}
            className="font-black text-white hover:text-[#FFB700] transition-colors block truncate text-sm sm:text-base"
            onClick={(e) => e.stopPropagation()}
          >
            {player.name}
          </Link>
          {player.club && (
            <div className="text-xs text-[#555] truncate">{player.club.name}</div>
          )}
        </div>

        {/* Key Stats */}
        <div className="hidden md:flex items-center gap-3 lg:gap-5 flex-shrink-0">
          <StatDisplay label="MP" value={stats.matchesPlayed} />
          <StatDisplay label="W" value={stats.wins} highlight="text-green-400" />
          <StatDisplay label="D" value={stats.draws} highlight="text-[#555]" />
          <StatDisplay label="L" value={stats.losses} highlight="text-red-400" />
          <StatDisplay label="GD" value={stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference} highlight={stats.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'} />
        </div>

        {/* Points pill */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="px-3 py-1.5 rounded-full text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
            <AnimatedCounter value={stats.totalPoints} format={(v) => `${Math.round(v)} pts`} />
          </div>
          <svg className={`w-4 h-4 text-[#333] transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-3 border-t border-[#1A1A1A]" role="region" aria-label="Detailed statistics">
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 mb-4">
            <MiniStat label="Matches" value={stats.matchesPlayed} color="text-white" />
            <MiniStat label="Wins" value={stats.wins} color="text-green-400" />
            <MiniStat label="Draws" value={stats.draws} color="text-[#555]" />
            <MiniStat label="Losses" value={stats.losses} color="text-red-400" />
            <MiniStat label="Goals Scored" value={stats.goalsScored} color="text-[#FF6600]" />
            <MiniStat label="Goals Conceded" value={stats.goalsConceded} color="text-[#CC2900]" />
            <MiniStat label="Goal Diff" value={stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference} color={stats.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'} />
            <MiniStat label="Points" value={stats.totalPoints} color="text-[#FFB700]" />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-[#555] mb-2">
              <span>Win Rate</span>
              <span className="font-bold text-white">{stats.matchesPlayed > 0 ? `${((stats.wins / stats.matchesPlayed) * 100).toFixed(1)}%` : '0%'}</span>
            </div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: '#1A1A1A' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: stats.matchesPlayed > 0 ? `${(stats.wins / stats.matchesPlayed) * 100}%` : '0%', background: 'linear-gradient(90deg,#FF6600,#FFB700)' }}
                role="progressbar"
                aria-valuenow={stats.matchesPlayed > 0 ? (stats.wins / stats.matchesPlayed) * 100 : 0}
                aria-valuemin={0} aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeaderboardStream({ tournament, rankings }: LeaderboardStreamProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (rank: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(rank) ? next.delete(rank) : next.add(rank);
      return next;
    });
  };

  if (rankings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1E1E1E] text-center py-20" style={{ background: '#111' }}>
        <div className="text-5xl mb-4">📊</div>
        <h3 className="text-xl font-black text-white mb-2">No Rankings Yet</h3>
        <p className="text-sm text-[#555]">The leaderboard will be populated once matches are completed.</p>
      </div>
    );
  }

  return (
    <StaggerContainer speed="fast">
      <div className="space-y-2">
        {rankings.map((entry) => (
          <StaggerItem key={entry.isTeam ? `team-${entry.team?.clubId}-${entry.team?.playerA?.id}-${entry.team?.playerB?.id}` : `player-${entry.player?.id}`}>
            <RankAnimation currentRank={entry.rank}>
              <LeaderboardRow
                entry={entry}
                isExpanded={expandedRows.has(entry.rank)}
                onToggle={() => toggleRow(entry.rank)}
              />
            </RankAnimation>
          </StaggerItem>
        ))}
      </div>
    </StaggerContainer>
  );
}
