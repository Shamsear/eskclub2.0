import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Match {
  id: number;
  date: string;
  stage: {
    id: number;
    name: string;
  };
  isTeamMatch?: boolean;
  team1?: {
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
    score: number;
  } | null;
  team2?: {
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
    score: number;
  } | null;
  player1: {
    id: number;
    name: string;
    photo: string | null;
  } | null;
  player2: {
    id: number;
    name: string;
    photo: string | null;
  } | null;
  player1Score: number | null;
  player2Score: number | null;
  winner: {
    id: number;
    name: string;
  } | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface TournamentMatchesData {
  tournament: {
    id: number;
    name: string;
  };
  matches: Match[];
}

async function getTournamentMatches(id: number): Promise<TournamentMatchesData | null> {
  try {
    // Use direct database query instead of API fetch for better reliability
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!tournament) {
      return null;
    }

    // Get all matches for this tournament with results
    const matches = await prisma.match.findMany({
      where: {
        tournamentId: id,
      },
      include: {
        stage: {
          select: {
            id: true,
            stageName: true,
            stageOrder: true,
          },
        },
        results: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                photo: true,
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
        teamResults: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            playerA: {
              select: {
                id: true,
                name: true,
                photo: true,
              },
            },
            playerB: {
              select: {
                id: true,
                name: true,
                photo: true,
              },
            },
          },
          orderBy: {
            teamPosition: 'asc',
          },
        },
      },
      orderBy: [
        { matchDate: 'desc' },
      ],
    });

    // Transform matches to the expected format
    const transformedMatches = matches.map((match) => {
      // Check if it's a team match (doubles)
      if (match.isTeamMatch && match.teamResults.length > 0) {
        const team1 = match.teamResults[0];
        const team2 = match.teamResults[1];

        // Determine status - check walkover first
        let status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 'SCHEDULED';

        if (match.walkoverWinnerId !== null && match.walkoverWinnerId !== undefined) {
          status = 'CANCELLED';
        } else if (team1 && team2 && team1.outcome && team2.outcome) {
          status = 'COMPLETED';
        }

        // Determine winner (for team matches, we'll show the club that won)
        let winner = null;
        if (status === 'COMPLETED' && team1 && team2) {
          if (team1.outcome === 'WIN') {
            winner = { id: team1.clubId, name: team1.club?.name || 'Team 1' };
          } else if (team2.outcome === 'WIN') {
            winner = { id: team2.clubId, name: team2.club?.name || 'Team 2' };
          }
        }

        return {
          id: match.id,
          date: match.matchDate.toISOString(),
          stage: match.stage ? {
            id: match.stage.id,
            name: match.stage.stageName,
          } : {
            id: 0,
            name: match.stageName || 'General',
          },
          isTeamMatch: true,
          team1: team1 ? {
            clubId: team1.clubId,
            clubName: team1.club?.name || 'Team 1',
            clubLogo: team1.club?.logo,
            playerA: team1.playerA,
            playerB: team1.playerB,
            score: team1.goalsScored,
          } : null,
          team2: team2 ? {
            clubId: team2.clubId,
            clubName: team2.club?.name || 'Team 2',
            clubLogo: team2.club?.logo,
            playerA: team2.playerA,
            playerB: team2.playerB,
            score: team2.goalsScored,
          } : null,
          player1: null,
          player2: null,
          player1Score: null,
          player2Score: null,
          winner,
          status,
        };
      }

      // Singles match
      const player1Result = match.results[0];
      const player2Result = match.results[1];

      // Determine status based on results - check walkover first
      let status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 'SCHEDULED';

      // Check for walkover first before checking completion
      if (match.walkoverWinnerId !== null && match.walkoverWinnerId !== undefined) {
        status = 'CANCELLED';
      } else if (player1Result && player2Result &&
        player1Result.outcome && player2Result.outcome) {
        status = 'COMPLETED';
      }

      // Determine winner
      let winner = null;
      if (status === 'COMPLETED' && player1Result && player2Result) {
        if (player1Result.outcome === 'WIN') {
          winner = player1Result.player;
        } else if (player2Result.outcome === 'WIN') {
          winner = player2Result.player;
        }
      } else if (match.walkoverWinnerId && match.walkoverWinnerId > 0) {
        const winnerResult = match.results.find(r => r.playerId === match.walkoverWinnerId);
        if (winnerResult) {
          winner = winnerResult.player;
        }
      }

      return {
        id: match.id,
        date: match.matchDate.toISOString(),
        stage: match.stage ? {
          id: match.stage.id,
          name: match.stage.stageName,
        } : {
          id: 0,
          name: match.stageName || 'General',
        },
        isTeamMatch: false,
        team1: null,
        team2: null,
        player1: player1Result ? player1Result.player : null,
        player2: player2Result ? player2Result.player : null,
        player1Score: player1Result ? player1Result.goalsScored : null,
        player2Score: player2Result ? player2Result.goalsScored : null,
        winner,
        status,
      };
    });

    return {
      tournament,
      matches: transformedMatches,
    };
  } catch (error) {
    console.error('Error fetching tournament matches:', error);
    return null;
  }
}

async function TournamentMatchesContent({ tournamentId }: { tournamentId: number }) {
  const data = await getTournamentMatches(tournamentId);

  if (!data) {
    notFound();
  }

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/15 text-green-400 border-green-500/40';
      case 'IN_PROGRESS': return 'bg-blue-500/15 text-blue-400 border-blue-500/40';
      case 'SCHEDULED': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40';
      case 'CANCELLED': return 'bg-red-500/15 text-red-400 border-red-500/40';
      default: return 'bg-[#1A1A1A] text-[#707070] border-[#333]';
    }
  };

  const groupedMatches = data.matches.reduce((acc, match) => {
    const stageName = match.stage.name;
    if (!acc[stageName]) {
      acc[stageName] = [];
    }
    acc[stageName].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

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
            <li><Link href="/tournaments" className="hover:text-[#FFB700] transition-colors">Tournaments</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li><Link href={`/tournaments/${data.tournament.id}`} className="hover:text-[#FFB700] transition-colors">{data.tournament.name}</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li className="text-[#FFB700] font-semibold">Matches</li>
          </ol>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border border-[#FFB700]/25 text-xs font-bold tracking-widest uppercase text-[#FFB700]" style={{ background: "rgba(255,183,0,0.08)" }}>📋 Match Schedule</div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 font-['Outfit',sans-serif]">
              All <span style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Matches</span>
            </h1>
            <p className="text-[#707070] text-sm">{data.tournament.name}</p>
          </div>
          <Link href={`/tournaments/${data.tournament.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1E1E1E] text-[#A0A0A0] hover:text-white hover:border-[#FF6600]/40 text-sm font-medium transition-all flex-shrink-0"
            style={{ background: '#111' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Tournament
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Matches', value: data.matches.length, color: '#FF6600' },
            { label: 'Completed', value: data.matches.filter((m: Match) => m.status === 'COMPLETED').length, color: '#22C55E' },
            { label: 'Scheduled', value: data.matches.filter((m: Match) => m.status === 'SCHEDULED').length, color: '#FFB700' },
            { label: 'Stages', value: Object.keys(groupedMatches).length, color: '#A78BFA' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-[#1E1E1E] p-4 sm:p-5 hover:-translate-y-0.5 transition-all" style={{ background: '#111' }}>
              <div className="text-xs text-[#555] font-medium uppercase tracking-widest mb-2">{label}</div>
              <div className="text-3xl font-black" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Matches by Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {Object.entries(groupedMatches).map(([stageName, matches]) => (
          <div key={stageName} className="mb-12">
            <div className="mb-5">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg,#FF6600,#CC2900)" }} />
                <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">{stageName}</h2>
                <span className="text-xs text-[#555] font-medium">({matches.length} {matches.length === 1 ? 'match' : 'matches'})</span>
              </div>
            </div>

            <div className="grid gap-3">
              {matches.map((match) => (
                <Link key={match.id} href={`/matches/${match.id}`}
                  className="block rounded-2xl border border-[#1E1E1E] hover:border-[#FF6600]/40 transition-all duration-200 overflow-hidden group"
                  style={{ background: '#111' }}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                      {/* Match header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(match.status)}`}>
                            {match.status.replace('_', ' ')}
                          </div>
                          {match.isTeamMatch && (
                            <div className="px-2.5 py-1 rounded-lg text-xs font-bold border" style={{ background: 'rgba(167,139,250,0.1)', color: '#A78BFA', borderColor: 'rgba(167,139,250,0.3)' }}>DOUBLES</div>
                          )}
                        </div>
                        <div className="text-xs text-[#555]">
                          {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      {/* Walkover/Forfeit Banner */}
                      {match.status === 'CANCELLED' && (
                        <div className="rounded-xl border border-yellow-500/20 p-2.5 mb-3 text-center" style={{ background: 'rgba(234,179,8,0.06)' }}>
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-sm text-yellow-400 font-bold">
                              {match.winner ? 'Walkover' : 'Both players forfeited'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Team Match Display */}
                      {match.isTeamMatch && match.team1 && match.team2 ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          {[match.team1, match.team2].map((team, ti) => team && (
                            <div key={ti} className="flex-1 rounded-xl p-3 border border-[#2A1A3A]" style={{ background: 'rgba(167,139,250,0.06)' }}>
                              <div className="flex items-center gap-2 mb-2">
                                {team.clubLogo && <img src={team.clubLogo} alt={team.clubName} className="w-6 h-6 object-contain" />}
                                <div className="font-bold text-sm text-white">{team.clubName}</div>
                                {team.score !== null && <div className="ml-auto text-xl font-black text-[#A78BFA]">{team.score}</div>}
                              </div>
                              <div className="space-y-1">
                                {[team.playerA, team.playerB].filter(Boolean).map((p, pi) => p && (
                                  <div key={pi} className="flex items-center gap-2">
                                    {p.photo ? <img src={p.photo} alt={p.name} className="w-5 h-5 rounded-full object-cover" /> : <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#A78BFA,#7C3AED)" }}>{p.name.charAt(0)}</div>}
                                    <span className="text-xs text-[#A0A0A0]">{p.name}</span>
                                  </div>
                                ))}
                              </div>
                              {match.status === 'COMPLETED' && match.winner?.id === team.clubId && <div className="mt-1.5 text-xs text-green-400 font-semibold">✓ Winner</div>}
                              {match.status === 'CANCELLED' && match.winner?.id === team.clubId && (
                                <div className="mt-1.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    {match.winner ? 'WO' : 'FF'}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="flex-shrink-0 text-center px-2">
                            <div className="text-lg font-black text-[#333]">VS</div>
                          </div>
                        </div>
                      ) : (
                        /* Singles Match */
                        <div className="flex items-center gap-3">
                          {/* Player 1 */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-1">
                            {match.player1 ? (
                              <>
                                {match.player1.photo ? <img src={match.player1.photo} alt={match.player1.name} className="w-10 h-10 rounded-full object-cover border border-[#FF6600]/50 flex-shrink-0" /> : <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>{match.player1.name.charAt(0)}</div>}
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm text-white truncate group-hover:text-[#FFB700] transition-colors">{match.player1.name}</div>
                                  {match.status === 'COMPLETED' && match.winner?.id === match.player1.id && <div className="text-xs text-green-400 font-semibold">✓ Winner</div>}
                                  {match.status === 'CANCELLED' && match.winner?.id === match.player1.id && (
                                    <div className="mt-1">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                        {match.winner ? 'WO' : 'FF'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {match.player1Score !== null && <div className="text-2xl font-black text-[#FF6600] flex-shrink-0">{match.player1Score}</div>}
                              </>
                            ) : <div className="flex-1 text-xs text-[#555] italic">TBD</div>}
                          </div>
                          <div className="flex-shrink-0 text-[#333] font-black text-lg">VS</div>
                          {/* Player 2 */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 flex-row-reverse">
                            {match.player2 ? (
                              <>
                                {match.player2.photo ? <img src={match.player2.photo} alt={match.player2.name} className="w-10 h-10 rounded-full object-cover border border-[#FF6600]/50 flex-shrink-0" /> : <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>{match.player2.name.charAt(0)}</div>}
                                <div className="flex-1 min-w-0 text-right">
                                  <div className="font-bold text-sm text-white truncate group-hover:text-[#FFB700] transition-colors">{match.player2.name}</div>
                                  {match.status === 'COMPLETED' && match.winner?.id === match.player2.id && <div className="text-xs text-green-400 font-semibold">✓ Winner</div>}
                                  {match.status === 'CANCELLED' && match.winner?.id === match.player2.id && (
                                    <div className="mt-1">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                        {match.winner ? 'WO' : 'FF'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {match.player2Score !== null && <div className="text-2xl font-black text-[#FF6600] flex-shrink-0">{match.player2Score}</div>}
                              </>
                            ) : <div className="flex-1 text-xs text-[#555] italic text-right">TBD</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {data.matches.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#1E1E1E] text-center py-16" style={{ background: '#111' }}>
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-black text-white mb-2">No Matches Yet</h3>
            <p className="text-[#555] text-sm">Matches will appear here once they are scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function TournamentMatchesPage({ params }: PageProps) {
  const { id } = await params;
  const tournamentId = parseInt(id);

  if (isNaN(tournamentId)) {
    notFound();
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#FF6600] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#707070] text-sm">Loading matches…</p>
        </div>
      </div>
    }>
      <TournamentMatchesContent tournamentId={tournamentId} />
    </Suspense>
  );
}
