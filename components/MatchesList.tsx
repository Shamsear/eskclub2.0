'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { OptimizedImage } from './ui/OptimizedImage';

interface MatchResult {
  id: number;
  playerId: number;
  outcome: 'WIN' | 'DRAW' | 'LOSS';
  goalsScored: number;
  goalsConceded: number;
  pointsEarned: number;
  player: {
    id: number;
    name: string;
    photo: string | null;
  };
}

interface TeamMatchResult {
  id: number;
  teamPosition: number;
  outcome: 'WIN' | 'DRAW' | 'LOSS';
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
}

interface Match {
  id: number;
  matchDate: string;
  stageName: string | null;
  walkoverWinnerId: number | null;
  isTeamMatch?: boolean;
  tournament: {
    id: number;
    name: string;
    club: { id: number; name: string } | null;
  };
  results: MatchResult[];
  teamResults?: TeamMatchResult[];
  stage: { id: number; stageName: string; stageOrder: number } | null;
}

const outcomeStyle: Record<string, { pill: string; glow: string }> = {
  WIN: { pill: 'bg-green-500/20 text-green-400 border border-green-500/30', glow: 'border-green-500/20' },
  DRAW: { pill: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25', glow: 'border-yellow-500/20' },
  LOSS: { pill: 'bg-red-500/15 text-red-400 border border-red-500/25', glow: 'border-red-500/20' },
};

function PlayerSlot({
  result,
  align,
}: {
  result: MatchResult | undefined;
  align: 'left' | 'right';
}) {
  if (!result) return <div className="flex-1" />;

  const style = outcomeStyle[result.outcome];
  const isRight = align === 'right';

  return (
    <div className={`flex-1 flex items-center gap-3 p-3 sm:p-4 rounded-xl border ${style.glow}`}
      style={{ background: '#0D0D0D', flexDirection: isRight ? 'row-reverse' : 'row' }}>
      {/* Avatar */}
      {result.player.photo ? (
        <OptimizedImage
          src={result.player.photo}
          alt={result.player.name}
          width={48} height={48}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-[#FF6600]/40 flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
          <span className="text-white font-black text-sm sm:text-base">
            {result.player.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Info */}
      <div className={`flex-1 min-w-0 ${isRight ? 'text-right' : 'text-left'}`}>
        <div className="font-black text-white text-sm sm:text-base truncate">{result.player.name}</div>
        <div className={`flex items-center gap-1.5 mt-1 ${isRight ? 'justify-end' : 'justify-start'}`}>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${style.pill}`}>
            {result.outcome}
          </span>
          <span className="text-[10px] text-[#555]">{result.pointsEarned} pts</span>
        </div>
      </div>

      {/* Score */}
      <div className={`text-2xl sm:text-3xl font-black flex-shrink-0 ${isRight ? 'ml-0 mr-1' : 'mr-0 ml-1'}`}
        style={{ color: result.outcome === 'WIN' ? '#22C55E' : result.outcome === 'DRAW' ? '#EAB308' : '#EF4444' }}>
        {result.goalsScored}
      </div>
    </div>
  );
}

function TeamSlot({
  teamResult,
  align,
}: {
  teamResult: TeamMatchResult | undefined;
  align: 'left' | 'right';
}) {
  if (!teamResult) return <div className="flex-1" />;

  const style = outcomeStyle[teamResult.outcome];
  const isRight = align === 'right';

  return (
    <div className={`flex-1 flex flex-col gap-2 p-3 sm:p-4 rounded-xl border ${style.glow}`}
      style={{ background: '#0D0D0D' }}>
      {/* Club header */}
      {teamResult.club && (
        <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
          {teamResult.club.logo && (
            <img src={teamResult.club.logo} alt={teamResult.club.name} className="w-5 h-5 object-contain" />
          )}
          <span className="text-xs font-bold text-white/80">{teamResult.club.name}</span>
        </div>
      )}

      {/* Players */}
      <div className="space-y-2">
        {/* Player A */}
        <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
          {teamResult.playerA.photo ? (
            <img src={teamResult.playerA.photo} alt={teamResult.playerA.name} 
              className="w-8 h-8 rounded-full object-cover border border-purple-500/40 flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#A855F7,#7C3AED)' }}>
              <span className="text-white font-black text-xs">
                {teamResult.playerA.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm text-white truncate">{teamResult.playerA.name}</span>
        </div>

        {/* Player B */}
        <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
          {teamResult.playerB.photo ? (
            <img src={teamResult.playerB.photo} alt={teamResult.playerB.name} 
              className="w-8 h-8 rounded-full object-cover border border-purple-500/40 flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#A855F7,#7C3AED)' }}>
              <span className="text-white font-black text-xs">
                {teamResult.playerB.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm text-white truncate">{teamResult.playerB.name}</span>
        </div>
      </div>

      {/* Outcome and Score */}
      <div className={`flex items-center gap-2 mt-1 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${style.pill}`}>
          {teamResult.outcome}
        </span>
        <span className="text-[10px] text-[#555]">{teamResult.pointsEarned} pts</span>
        <div className="text-2xl font-black ml-auto"
          style={{ color: teamResult.outcome === 'WIN' ? '#22C55E' : teamResult.outcome === 'DRAW' ? '#EAB308' : '#EF4444' }}>
          {teamResult.goalsScored}
        </div>
      </div>
    </div>
  );
}

export function MatchesList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchMatches(); }, []);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/matches');
      if (!res.ok) throw new Error('Failed to fetch matches');
      const data = await res.json();
      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6" role="status" aria-label="Loading matches">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#1E1E1E]" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{ borderTopColor: '#FF6600', borderRightColor: 'rgba(255,102,0,0.3)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: 'linear-gradient(135deg,#FF6600,#FFB700)', boxShadow: '0 0 10px rgba(255,102,0,0.8)' }}
            />
          </motion.div>
        </div>
        <motion.p
          className="text-sm text-[#444] font-medium tracking-widest uppercase"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
        >
          Loading matches...
        </motion.p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/40 p-10 text-center" style={{ background: '#111' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.1)' }}>
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 font-bold mb-2">{error}</p>
        <button onClick={fetchMatches}
          className="px-6 py-2.5 rounded-xl text-white font-black text-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
          Try Again
        </button>
      </div>
    );
  }

  /* ── Empty ── */
  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1E1E1E] p-16 text-center" style={{ background: '#111' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(255,102,0,0.08)' }}>
          <svg className="w-10 h-10 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-white mb-2">No matches yet</h3>
        <p className="text-sm text-[#555]">Matches will appear here once tournaments have started</p>
      </div>
    );
  }

  /* ── Match List ── */
  return (
    <div className="space-y-3">
      {matches.map((match, index) => {
        const isTeamMatch = match.teamResults && match.teamResults.length > 0;
        const [player1, player2] = match.results;
        const [team1, team2] = match.teamResults || [];
        const isWalkover = match.walkoverWinnerId !== null;

        return (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.48,
              delay: Math.min(index, 5) * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
          <Link
            href={`/matches/${match.id}`}
            className="block rounded-2xl border border-[#1E1E1E] hover:border-[#FF6600]/40 transition-all duration-300 overflow-hidden group"
            style={{ background: '#111' }}
          >
            {/* Header bar */}
            <div className="px-4 py-2.5 flex items-center justify-between gap-3"
              style={{ background: isTeamMatch ? 'linear-gradient(135deg,#A855F7 0%,#7C3AED 100%)' : 'linear-gradient(135deg,#FF6600 0%,#CC2900 100%)' }}>
              <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm min-w-0">
                {isTeamMatch ? (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
                <span className="truncate">{match.tournament.name}</span>
                {match.tournament.club && <span className="hidden md:inline opacity-75">• {match.tournament.club.name}</span>}
                {isTeamMatch && <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px]">2v2</span>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {match.stageName && (
                  <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold">
                    {match.stageName}
                  </span>
                )}
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(match.matchDate)}
                </div>
              </div>
            </div>

            {/* Body */}
            {isWalkover ? (
              <div className="p-4 sm:p-5">
                {/* Walkover Banner */}
                <div className="rounded-xl border border-yellow-500/20 p-3 mb-4 text-center"
                  style={{ background: 'rgba(234,179,8,0.06)' }}>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm text-yellow-400 font-bold">
                      {match.walkoverWinnerId === 0 ? 'Both players forfeited' : 'Walkover'}
                    </span>
                  </div>
                </div>

                {/* Show players even for walkover */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  {/* Team/Player 1 */}
                  {isTeamMatch ? <TeamSlot teamResult={team1} align="left" /> : <PlayerSlot result={player1} align="left" />}

                  {/* VS Divider */}
                  <div className="flex md:flex-col items-center justify-center gap-1 flex-shrink-0 self-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-yellow-500/40"
                      style={{ background: 'rgba(234,179,8,0.1)' }}>
                      <span className="text-yellow-400 font-black text-xs">
                        {match.walkoverWinnerId === 0 ? 'FF' : 'WO'}
                      </span>
                    </div>
                  </div>

                  {/* Team/Player 2 */}
                  {isTeamMatch ? <TeamSlot teamResult={team2} align="right" /> : <PlayerSlot result={player2} align="right" />}
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  {/* Team/Player 1 */}
                  {isTeamMatch ? <TeamSlot teamResult={team1} align="left" /> : <PlayerSlot result={player1} align="left" />}

                  {/* VS Divider */}
                  <div className="flex md:flex-col items-center justify-center gap-1 flex-shrink-0 self-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[#FF6600]/40"
                      style={{ background: 'rgba(255,102,0,0.1)' }}>
                      <span className="text-[#FF6600] font-black text-xs">VS</span>
                    </div>
                    {isTeamMatch && team1 && team2 && (
                      <span className="text-[10px] text-[#444] font-medium whitespace-nowrap">
                        {Math.abs(team1.goalsScored - team2.goalsScored)} GD
                      </span>
                    )}
                    {!isTeamMatch && player1 && player2 && (
                      <span className="text-[10px] text-[#444] font-medium whitespace-nowrap">
                        {Math.abs(player1.goalsScored - player2.goalsScored)} GD
                      </span>
                    )}
                  </div>

                  {/* Team/Player 2 */}
                  {isTeamMatch ? <TeamSlot teamResult={team2} align="right" /> : <PlayerSlot result={player2} align="right" />}
                </div>
              </div>
            )}

            {/* Hover bar */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
