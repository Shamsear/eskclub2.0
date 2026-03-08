import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import TournamentFilter from '@/components/leaderboard/TournamentFilter';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teams Leaderboard — Eskimos Club',
  description: 'Club teams ranked by points, wins, goals and win rate across all tournaments.',
};

interface PageProps {
  searchParams: Promise<{ tournament?: string }>;
}

interface TeamStats {
  club: { id: number; name: string; logo: string | null };
  stats: { totalPlayers: number; totalMatches: number; totalWins: number; totalDraws: number; totalLosses: number; totalGoalsScored: number; totalGoalsConceded: number; totalPoints: number; winRate: number };
}

async function getTeamsLeaderboard(tournamentId?: string) {
  try {
    const where = tournamentId ? { match: { tournamentId: parseInt(tournamentId) } } : {};
    
    // Get clubs with both individual match results and team match results
    const clubs = await prisma.club.findMany({ 
      include: { 
        players: { 
          include: { 
            matchResults: { where } 
          } 
        },
        teamMatches: {
          where: tournamentId ? { match: { tournamentId: parseInt(tournamentId) } } : {},
        }
      } 
    });
    
    const teamStats = clubs.map(club => {
      // Get individual player results (singles matches)
      const allResults = club.players.flatMap(p => p.matchResults);
      
      // Get team match results (doubles matches)
      const teamResults = club.teamMatches;
      
      // Calculate stats from individual results
      const individualMatches = allResults.length;
      const individualWins = allResults.filter(r => r.outcome === 'WIN').length;
      const individualDraws = allResults.filter(r => r.outcome === 'DRAW').length;
      const individualLosses = allResults.filter(r => r.outcome === 'LOSS').length;
      const individualGoalsScored = allResults.reduce((s, r) => s + r.goalsScored, 0);
      const individualGoalsConceded = allResults.reduce((s, r) => s + r.goalsConceded, 0);
      const individualPoints = allResults.reduce((s, r) => s + r.pointsEarned, 0);
      
      // Calculate stats from team results
      const teamMatches = teamResults.length;
      const teamWins = teamResults.filter(r => r.outcome === 'WIN').length;
      const teamDraws = teamResults.filter(r => r.outcome === 'DRAW').length;
      const teamLosses = teamResults.filter(r => r.outcome === 'LOSS').length;
      const teamGoalsScored = teamResults.reduce((s, r) => s + r.goalsScored, 0);
      const teamGoalsConceded = teamResults.reduce((s, r) => s + r.goalsConceded, 0);
      const teamPoints = teamResults.reduce((s, r) => s + r.pointsEarned, 0);
      
      // Combine stats
      const totalMatches = individualMatches + teamMatches;
      const totalWins = individualWins + teamWins;
      const totalDraws = individualDraws + teamDraws;
      const totalLosses = individualLosses + teamLosses;
      const totalGoalsScored = individualGoalsScored + teamGoalsScored;
      const totalGoalsConceded = individualGoalsConceded + teamGoalsConceded;
      const totalPoints = individualPoints + teamPoints;
      
      if (totalMatches === 0) {
        return { 
          club: { id: club.id, name: club.name, logo: club.logo }, 
          stats: { 
            totalPlayers: club.players.length, 
            totalMatches: 0, 
            totalWins: 0, 
            totalDraws: 0, 
            totalLosses: 0, 
            totalGoalsScored: 0, 
            totalGoalsConceded: 0, 
            totalPoints: 0, 
            winRate: 0 
          } 
        };
      }
      
      return { 
        club: { id: club.id, name: club.name, logo: club.logo }, 
        stats: { 
          totalPlayers: club.players.length, 
          totalMatches, 
          totalWins, 
          totalDraws, 
          totalLosses, 
          totalGoalsScored, 
          totalGoalsConceded, 
          totalPoints, 
          winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0 
        } 
      };
    });
    
    return { teams: teamStats.filter(t => t.stats.totalMatches > 0).sort((a, b) => b.stats.totalPoints - a.stats.totalPoints) };
  } catch { 
    return null; 
  }
}

async function getTournaments() {
  try { return await prisma.tournament.findMany({ select: { id: true, name: true }, orderBy: { startDate: 'desc' } }); }
  catch { return []; }
}

const rankStyles = [
  'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
  'bg-gradient-to-br from-gray-400 to-gray-600 text-white',
  'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
];

async function TeamsLeaderboardContent({ tournamentId }: { tournamentId?: string }) {
  const [data, tournaments] = await Promise.all([getTeamsLeaderboard(tournamentId), getTournaments()]);
  if (!data) notFound();
  const selectedTournament = tournamentId ? tournaments.find((t: any) => t.id === parseInt(tournamentId)) : null;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Hero */}
      <div className="relative overflow-hidden py-14 sm:py-20" style={{ background: "linear-gradient(180deg,#0D0D0D 0%,#110800 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,183,0,0.12) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #FFB700, transparent)" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFB700]/30 to-transparent" />

        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-[#555]">
            <li><Link href="/" className="hover:text-[#FFB700] transition-colors">Home</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li><Link href="/leaderboard/teams" className="hover:text-[#FFB700] transition-colors">Leaderboard</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li className="text-[#FFB700] font-semibold">Teams</li>
          </ol>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 border border-[#FFB700]/25 text-xs font-bold tracking-widest uppercase text-[#FFB700]" style={{ background: "rgba(255,183,0,0.08)" }}>
            🏆 Club Rankings
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 font-['Outfit',sans-serif]">
            Teams{" "}
            <span style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Leaderboard
            </span>
          </h1>
          <p className="text-[#707070] text-base sm:text-lg">
            {selectedTournament ? selectedTournament.name : 'Overall Rankings — All Tournaments'}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-10">
        <TournamentFilter currentTournamentId={tournamentId} tournaments={tournaments} leaderboardType="teams" />
      </div>

      {/* Desktop Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 hidden md:block">
        <div className="rounded-2xl overflow-hidden border border-[#1E1E1E]" style={{ background: "#111" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "linear-gradient(90deg,#FF6600,#CC2900)" }}>
                  {['Rank', 'Team', 'Players', 'Matches', 'W / D / L', 'Goals', 'Win Rate', 'Points'].map(h => (
                    <th key={h} className={`px-5 py-4 text-xs font-bold text-white uppercase tracking-widest ${h === 'Rank' || h === 'Team' ? 'text-left' : 'text-center'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.teams.map((item: TeamStats, index: number) => (
                  <tr key={item.club.id} className="border-t border-[#1A1A1A] hover:bg-[#FF6600]/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${index < 3 ? rankStyles[index] : 'bg-[#1A1A1A] text-[#707070]'}`}>{index + 1}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/clubs/${item.club.id}`} className="flex items-center gap-3 group">
                        {item.club.logo ? (
                          <img src={item.club.logo} alt={item.club.name} className="w-10 h-10 rounded-lg object-cover border border-[#FF6600]/30 group-hover:border-[#FF6600] transition-colors" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>{item.club.name.charAt(0)}</div>
                        )}
                        <div className="font-bold text-white group-hover:text-[#FFB700] transition-colors text-sm">{item.club.name}</div>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-center text-white font-semibold text-sm">{item.stats.totalPlayers}</td>
                    <td className="px-5 py-4 text-center text-white font-semibold text-sm">{item.stats.totalMatches}</td>
                    <td className="px-5 py-4 text-center text-sm">
                      <span className="text-green-400 font-semibold">{item.stats.totalWins}</span>
                      <span className="text-[#333] mx-1">/</span>
                      <span className="text-yellow-400 font-semibold">{item.stats.totalDraws}</span>
                      <span className="text-[#333] mx-1">/</span>
                      <span className="text-red-400 font-semibold">{item.stats.totalLosses}</span>
                    </td>
                    <td className="px-5 py-4 text-center text-white font-semibold text-sm">{item.stats.totalGoalsScored}–{item.stats.totalGoalsConceded}</td>
                    <td className="px-5 py-4 text-center"><span className="text-[#FFB700] font-bold text-sm">{item.stats.winRate.toFixed(1)}%</span></td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-2xl font-black" style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{item.stats.totalPoints}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:hidden">
        <div className="space-y-3">
          {data.teams.map((item: TeamStats, index: number) => (
            <Link key={item.club.id} href={`/clubs/${item.club.id}`} className="block rounded-2xl border border-[#1E1E1E] bg-[#111] hover:border-[#FF6600]/40 transition-all duration-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${index < 3 ? rankStyles[index] : 'bg-[#1A1A1A] text-[#707070]'}`}>{index + 1}</div>
                  <div className="text-right">
                    <div className="text-2xl font-black" style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{item.stats.totalPoints}</div>
                    <div className="text-[#555] text-xs">pts</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {item.club.logo ? (
                    <img src={item.club.logo} alt={item.club.name} className="w-11 h-11 rounded-lg object-cover border border-[#FF6600]/30 flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-black flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>{item.club.name.charAt(0)}</div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate text-sm">{item.club.name}</div>
                    <div className="text-[#555] text-xs">{item.stats.totalPlayers} Players</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1A1A1A] text-center">
                  <div><div className="text-[#555] text-xs mb-0.5">Matches</div><div className="text-white font-bold text-sm">{item.stats.totalMatches}</div></div>
                  <div><div className="text-[#555] text-xs mb-0.5">W/D/L</div><div className="text-xs font-semibold"><span className="text-green-400">{item.stats.totalWins}</span>/<span className="text-yellow-400">{item.stats.totalDraws}</span>/<span className="text-red-400">{item.stats.totalLosses}</span></div></div>
                  <div><div className="text-[#555] text-xs mb-0.5">Win Rate</div><div className="text-[#FFB700] font-bold text-sm">{item.stats.winRate.toFixed(1)}%</div></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;

export default async function TeamsLeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#FF6600] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#707070] text-sm">Loading leaderboard…</p>
        </div>
      </div>
    }>
      <TeamsLeaderboardContent tournamentId={params.tournament} />
    </Suspense>
  );
}
