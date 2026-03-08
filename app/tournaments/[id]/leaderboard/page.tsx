import { notFound } from 'next/navigation';
import Link from 'next/link';
import LeaderboardStream from '@/components/public/LeaderboardStream';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';

interface PageProps { params: Promise<{ id: string }> }
export const revalidate = 300;

// ── data fetching identical to before, just keeping it here ──
async function getLeaderboardData(id: number): Promise<any> {
  try {
    const tournament = await prisma.tournament.findUnique({ where: { id }, select: { id: true, name: true, matchFormat: true } });
    if (!tournament) return null;

    if (tournament.matchFormat === 'DOUBLES') {
      const teamStats = await prisma.teamMatchResult.groupBy({
        by: ['clubId', 'playerAId', 'playerBId'],
        where: { match: { tournamentId: id } },
        _sum: { pointsEarned: true, goalsScored: true, goalsConceded: true },
        _count: { id: true },
      });
      const enriched = await Promise.all(teamStats.map(async (team) => {
        const [club, playerA, playerB, outcomes] = await Promise.all([
          prisma.club.findUnique({ where: { id: team.clubId }, select: { id: true, name: true, logo: true } }),
          prisma.player.findUnique({ where: { id: team.playerAId }, select: { id: true, name: true, photo: true } }),
          prisma.player.findUnique({ where: { id: team.playerBId }, select: { id: true, name: true, photo: true } }),
          prisma.teamMatchResult.groupBy({ by: ['outcome'], where: { clubId: team.clubId, playerAId: team.playerAId, playerBId: team.playerBId, match: { tournamentId: id } }, _count: { outcome: true } }),
        ]);
        const wins = outcomes.find(o => o.outcome === 'WIN')?._count.outcome || 0;
        const draws = outcomes.find(o => o.outcome === 'DRAW')?._count.outcome || 0;
        const losses = outcomes.find(o => o.outcome === 'LOSS')?._count.outcome || 0;
        const goalsScored = team._sum.goalsScored || 0;
        const goalsConceded = team._sum.goalsConceded || 0;
        return { clubId: team.clubId, club, playerA, playerB, matchesPlayed: team._count.id, wins, draws, losses, goalsScored, goalsConceded, goalDifference: goalsScored - goalsConceded, totalPoints: team._sum.pointsEarned || 0 };
      }));
      enriched.sort((a, b) => b.totalPoints - a.totalPoints || b.goalDifference - a.goalDifference || b.goalsScored - a.goalsScored);
      return { tournament: { id: tournament.id, name: tournament.name }, rankings: enriched.map((e, i) => ({ rank: i + 1, isTeam: true, team: { clubId: e.clubId, clubName: e.club?.name || 'Team', clubLogo: e.club?.logo, playerA: e.playerA, playerB: e.playerB }, player: null, stats: { matchesPlayed: e.matchesPlayed, wins: e.wins, draws: e.draws, losses: e.losses, goalsScored: e.goalsScored, goalsConceded: e.goalsConceded, goalDifference: e.goalDifference, totalPoints: e.totalPoints } })) };
    }

    const stats = await prisma.tournamentPlayerStats.findMany({ 
      where: { tournamentId: id }, 
      include: { 
        player: { 
          select: { 
            id: true, 
            name: true, 
            photo: true, 
            club: { 
              select: { 
                id: true, 
                name: true, 
                logo: true 
              } 
            } 
          } 
        } 
      }, 
      orderBy: [
        { totalPoints: 'desc' }, 
        { goalsScored: 'desc' }, 
        { goalsConceded: 'asc' }
      ] 
    });
    
    const withDiff = stats.map(e => ({ ...e, goalDifference: e.goalsScored - e.goalsConceded }));
    withDiff.sort((a, b) => b.totalPoints - a.totalPoints || b.goalDifference - a.goalDifference || b.goalsScored - a.goalsScored);
    
    const rankings = withDiff.map((e, i) => ({ 
      rank: i + 1, 
      isTeam: false, 
      team: null, 
      player: { 
        id: e.player.id, 
        name: e.player.name, 
        photo: e.player.photo, 
        club: e.player.club 
      }, 
      stats: { 
        matchesPlayed: e.matchesPlayed, 
        wins: e.wins, 
        draws: e.draws, 
        losses: e.losses, 
        goalsScored: e.goalsScored, 
        goalsConceded: e.goalsConceded, 
        goalDifference: e.goalDifference, 
        totalPoints: e.totalPoints 
      } 
    }));
    
    return { tournament, rankings };
  } catch (e) { 
    console.error('Error fetching leaderboard data:', e); 
    return null; 
  }
}

/* ──────── Dark stat card ──────── */
function DStat({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#1E1E1E] p-5 hover:-translate-y-1 transition-all duration-300" style={{ background: '#111' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#555] font-medium uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  );
}

async function LeaderboardContent({ tournamentId }: { tournamentId: number }) {
  const data = await getLeaderboardData(tournamentId);
  if (!data) notFound();

  const totalGoals = data.rankings.reduce((s: number, r: any) => s + r.stats.goalsScored, 0);
  const totalMatches = Math.round(data.rankings.reduce((s: number, r: any) => s + r.stats.matchesPlayed, 0) / 2);
  const leader = data.rankings[0]?.isTeam ? data.rankings[0]?.team?.clubName : data.rankings[0]?.player?.name;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Hero */}
      <div className="relative overflow-hidden py-14 sm:py-20" style={{ background: "linear-gradient(180deg,#0D0D0D 0%,#110800 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,183,0,0.12) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#FF6600,transparent)" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-60" />

        {/* Breadcrumb */}
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-[#555]">
            <li><Link href="/tournaments" className="hover:text-[#FFB700] transition-colors">Tournaments</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li><Link href={`/tournaments/${data.tournament.id}`} className="hover:text-[#FFB700] transition-colors">{data.tournament.name}</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li className="text-[#FFB700] font-semibold">Leaderboard</li>
          </ol>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border border-[#FFB700]/25 text-xs font-bold tracking-widest uppercase text-[#FFB700]" style={{ background: "rgba(255,183,0,0.08)" }}>
              🏆 Rankings
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 font-['Outfit',sans-serif]">
              <span style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Leaderboard</span>
            </h1>
            <p className="text-[#707070] text-sm">{data.tournament.name}</p>
          </div>
          <Link href={`/tournaments/${data.tournament.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1E1E1E] text-[#A0A0A0] hover:text-white hover:border-[#FF6600]/40 text-sm font-medium transition-all"
            style={{ background: '#111' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Tournament
          </Link>
        </div>
      </div>

      {/* Stats */}
      {data.rankings.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DStat label={data.rankings[0]?.isTeam ? 'Total Teams' : 'Total Players'} value={data.rankings.length}
              icon={<svg className="w-5 h-5 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
            <DStat label="Total Matches" value={totalMatches}
              icon={<svg className="w-5 h-5 text-[#FFB700]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
            <DStat label="Total Goals" value={totalGoals} icon={<span className="text-xl">⚽</span>} />
            <DStat label="Current Leader" value={<span className="text-lg truncate" style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{leader || 'N/A'}</span>}
              icon={<span className="text-xl">🏆</span>} />
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <LeaderboardStream tournament={data.tournament} rankings={data.rankings} />
      </div>
    </div>
  );
}

export default async function LeaderboardPage({ params }: PageProps) {
  const { id } = await params;
  const tournamentId = parseInt(id);
  if (isNaN(tournamentId)) notFound();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#FF6600] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#707070] text-sm">Loading leaderboard…</p>
        </div>
      </div>
    }>
      <LeaderboardContent tournamentId={tournamentId} />
    </Suspense>
  );
}
