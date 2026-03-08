import { notFound } from 'next/navigation';
import TournamentDetailClient from '@/components/public/TournamentDetailClient';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTournamentData(id: number) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
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
            stagePoints: {
              select: {
                id: true,
                stageId: true,
                stageName: true,
                stageOrder: true,
                _count: {
                  select: {
                    matches: true,
                  },
                },
              },
              orderBy: {
                stageOrder: "asc",
              },
            },
          },
        },
        matches: {
          select: {
            id: true,
            matchDate: true,
            stageId: true,
            stageName: true,
            isTeamMatch: true,
            results: {
              select: {
                id: true,
              },
            },
            teamResults: {
              select: {
                id: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });

    if (!tournament) {
      return null;
    }

    const completedMatches = tournament.matches.filter(
      (match) => {
        // For team matches (doubles), check teamResults
        if (match.isTeamMatch) {
          return match.teamResults && match.teamResults.length > 0;
        }
        // For singles matches, check results
        return match.results.length > 0;
      }
    ).length;

    // Calculate total goals from both singles and doubles matches
    const singlesGoals = await prisma.matchResult.aggregate({
      where: {
        match: {
          tournamentId: id,
        },
      },
      _sum: {
        goalsScored: true,
      },
    });

    const doublesGoals = await prisma.teamMatchResult.aggregate({
      where: {
        match: {
          tournamentId: id,
        },
      },
      _sum: {
        goalsScored: true,
      },
    });

    const totalGoals = (singlesGoals._sum.goalsScored || 0) + (doublesGoals._sum.goalsScored || 0);

    const stages = tournament.pointSystemTemplate?.stagePoints.map((stage) => ({
      id: stage.id,
      name: stage.stageName,
      order: stage.stageOrder,
      matchCount: stage._count.matches,
    })) || [];

    return {
      tournament: {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        startDate: tournament.startDate.toISOString(),
        endDate: tournament.endDate?.toISOString() || null,
        club: tournament.club,
        pointSystem: {
          pointsPerWin: tournament.pointsPerWin,
          pointsPerDraw: tournament.pointsPerDraw,
          pointsPerLoss: tournament.pointsPerLoss,
          pointsPerGoalScored: tournament.pointsPerGoalScored,
          pointsPerGoalConceded: tournament.pointsPerGoalConceded,
        },
      },
      stages,
      stats: {
        totalMatches: tournament._count.matches,
        completedMatches,
        totalGoals: totalGoals,
        participantCount: tournament._count.participants,
      },
    };
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
}

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tournamentId = parseInt(id);

  if (isNaN(tournamentId)) {
    notFound();
  }

  const data = await getTournamentData(tournamentId);

  if (!data) {
    notFound();
  }

  return <TournamentDetailClient initialData={data} tournamentId={tournamentId} />;
}
