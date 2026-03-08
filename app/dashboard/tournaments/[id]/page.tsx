import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TournamentDetailsClient } from "@/components/TournamentDetailsClient";
import { Breadcrumb } from "@/components/Breadcrumb";

async function getTournamentDetails(id: string) {
  const tournamentId = parseInt(id);
  
  // Validate ID format
  if (isNaN(tournamentId) || tournamentId <= 0) {
    return null;
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        pointSystemTemplate: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        participants: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                photo: true,
                club: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        matches: {
          include: {
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
          orderBy: {
            matchDate: "desc",
          },
        },
        playerStats: {
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
                  },
                },
              },
            },
          },
          orderBy: [
            { totalPoints: "desc" },
            { goalsScored: "desc" },
            { wins: "desc" },
          ],
        },
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });

    // If it's a doubles tournament, aggregate team stats
    if (tournament && tournament.matchFormat === 'DOUBLES') {
      const teamStats = await prisma.teamMatchResult.groupBy({
        by: ['clubId', 'playerAId', 'playerBId'],
        where: {
          match: {
            tournamentId: tournamentId,
          },
        },
        _sum: {
          pointsEarned: true,
          goalsScored: true,
          goalsConceded: true,
        },
        _count: {
          id: true,
        },
      });

      // Get detailed info for each team
      const enrichedTeamStats = await Promise.all(
        teamStats.map(async (team) => {
          const [club, playerA, playerB, outcomes] = await Promise.all([
            prisma.club.findUnique({
              where: { id: team.clubId },
              select: { id: true, name: true, logo: true },
            }),
            prisma.player.findUnique({
              where: { id: team.playerAId },
              select: { id: true, name: true, photo: true },
            }),
            prisma.player.findUnique({
              where: { id: team.playerBId },
              select: { id: true, name: true, photo: true },
            }),
            prisma.teamMatchResult.groupBy({
              by: ['outcome'],
              where: {
                clubId: team.clubId,
                playerAId: team.playerAId,
                playerBId: team.playerBId,
                match: {
                  tournamentId: tournamentId,
                },
              },
              _count: {
                outcome: true,
              },
            }),
          ]);

          const wins = outcomes.find(o => o.outcome === 'WIN')?._count.outcome || 0;
          const draws = outcomes.find(o => o.outcome === 'DRAW')?._count.outcome || 0;
          const losses = outcomes.find(o => o.outcome === 'LOSS')?._count.outcome || 0;

          return {
            id: `${team.clubId}-${team.playerAId}-${team.playerBId}`,
            clubId: team.clubId,
            club,
            playerA,
            playerB,
            matchesPlayed: team._count.id,
            wins,
            draws,
            losses,
            goalsScored: team._sum.goalsScored || 0,
            goalsConceded: team._sum.goalsConceded || 0,
            totalPoints: team._sum.pointsEarned || 0,
          };
        })
      );

      // Sort by points, then goal difference, then goals scored
      enrichedTeamStats.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        const gdA = a.goalsScored - a.goalsConceded;
        const gdB = b.goalsScored - b.goalsConceded;
        if (gdB !== gdA) return gdB - gdA;
        return b.goalsScored - a.goalsScored;
      });

      return { ...tournament, teamStats: enrichedTeamStats };
    }

    return tournament;
  } catch (error) {
    // Log error but return null to trigger not found
    console.error('Error fetching tournament details:', error);
    return null;
  }
}

export default async function TournamentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return notFound();
  }

  const { id } = await params;
  const tournament = await getTournamentDetails(id);

  if (!tournament) {
    return notFound();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tournaments", href: "/dashboard/tournaments" },
          { label: tournament.name },
        ]}
      />

      {/* Tournament Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <Link
            href="/dashboard/tournaments"
            className="inline-flex items-center gap-2 text-white hover:text-purple-100 transition-colors mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tournaments
          </Link>
          
          <div className="flex items-start gap-4">
            {tournament.club && tournament.club.logo ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src={tournament.club.logo}
                  alt={`${tournament.club.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
                {tournament.name}
              </h1>
              {tournament.description && (
                <p className="text-purple-100 mb-4 text-sm sm:text-base">{tournament.description}</p>
              )}
              {tournament.club && (
                <Link
                  href={`/dashboard/clubs/${tournament.club.id}`}
                  className="inline-flex items-center gap-2 text-white hover:text-purple-100 underline text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {tournament.club.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 sm:p-5 text-white shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-1">
            {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <p className="text-xs sm:text-sm text-white text-opacity-90">Start Date</p>
        </div>

        {tournament.endDate && (
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 sm:p-5 text-white shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1">
              {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs sm:text-sm text-white text-opacity-90">End Date</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 sm:p-5 text-white shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-1">{tournament._count.participants}</p>
          <p className="text-xs sm:text-sm text-white text-opacity-90">Participants</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 sm:p-5 text-white shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-1">{tournament._count.matches}</p>
          <p className="text-xs sm:text-sm text-white text-opacity-90">Matches</p>
        </div>
      </div>

      {/* Point System */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Point System</h3>
                <p className="text-sm text-gray-600 mt-0.5">Scoring rules for this tournament</p>
              </div>
            </div>
            {tournament.pointSystemTemplate && (
              <Link
                href={`/dashboard/point-systems/${tournament.pointSystemTemplate.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {tournament.pointSystemTemplate.name}
              </Link>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { label: 'Win', value: tournament.pointsPerWin, gradient: 'from-green-500 to-emerald-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'Draw', value: tournament.pointsPerDraw, gradient: 'from-yellow-500 to-orange-600', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'Loss', value: tournament.pointsPerLoss, gradient: 'from-red-500 to-pink-600', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'Goal Scored', value: tournament.pointsPerGoalScored, gradient: 'from-blue-500 to-cyan-600', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
              { label: 'Goal Conceded', value: tournament.pointsPerGoalConceded, gradient: 'from-purple-500 to-indigo-600', icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' },
            ].map((item, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${item.gradient} rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{item.value}</p>
                <p className="text-xs text-white text-opacity-90">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client Component for Tabs and Actions */}
      <TournamentDetailsClient tournament={tournament} />
    </div>
  );
}
