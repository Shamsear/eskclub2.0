import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { MatchTheater } from '@/components/public/MatchTheater';
import { PublicSkeletons } from '@/components/public/PublicSkeletons';
import { PerformanceMonitor } from '@/components/public/PerformanceMonitor';
import { prisma } from '@/lib/prisma';

interface MatchDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getMatchData(id: string) {
  try {
    const matchId = parseInt(id);
    
    if (isNaN(matchId)) {
      return null;
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            startDate: true,
          },
        },
        stage: {
          select: {
            id: true,
            stageName: true,
          },
        },
        results: {
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
                    logo: true,
                  },
                },
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
    });

    if (!match) {
      return null;
    }

    // Check if it's a team match (doubles)
    if (match.isTeamMatch && match.teamResults.length > 0) {
      return {
        match: {
          id: match.id,
          date: match.matchDate.toISOString(),
          stageName: match.stage ? match.stage.stageName : match.stageName,
          tournament: {
            id: match.tournament.id,
            name: match.tournament.name,
          },
          isTeamMatch: true,
        },
        teamResults: match.teamResults.map(result => ({
          team: {
            clubId: result.clubId,
            clubName: result.club?.name || 'Team',
            clubLogo: result.club?.logo,
            playerA: result.playerA,
            playerB: result.playerB,
          },
          outcome: result.outcome as 'WIN' | 'DRAW' | 'LOSS',
          goalsScored: result.goalsScored,
          goalsConceded: result.goalsConceded,
          pointsEarned: result.pointsEarned,
          basePoints: result.basePoints,
          conditionalPoints: result.conditionalPoints,
        })),
        results: [],
      };
    }

    // Singles match - Transform to expected format
    return {
      match: {
        id: match.id,
        date: match.matchDate.toISOString(),
        stageName: match.stage ? match.stage.stageName : match.stageName,
        tournament: {
          id: match.tournament.id,
          name: match.tournament.name,
        },
        isTeamMatch: false,
      },
      results: match.results.map(result => ({
        player: {
          id: result.player.id,
          name: result.player.name,
          photo: result.player.photo,
          club: result.player.club || {
            id: 0,
            name: 'Free Agent',
            logo: null,
          },
        },
        outcome: result.outcome as 'WIN' | 'DRAW' | 'LOSS',
        goalsScored: result.goalsScored,
        goalsConceded: result.goalsConceded,
        pointsEarned: result.pointsEarned,
        basePoints: result.basePoints,
        conditionalPoints: result.conditionalPoints,
      })),
      teamResults: [],
    };
  } catch (error) {
    console.error('Error fetching match data:', error);
    return null;
  }
}

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const data = await getMatchData(id);

  if (!data) {
    notFound();
  }

  return (
    <>
      <PerformanceMonitor pageName={`match-${id}`} />
      <Suspense fallback={<PublicSkeletons.MatchTheater />}>
        <MatchTheater data={data} />
      </Suspense>
    </>
  );
}

export async function generateMetadata({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const data = await getMatchData(id);

  if (!data) {
    return {
      title: 'Match Not Found',
    };
  }

  const matchDate = new Date(data.match.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    title: `Match #${data.match.id} - ${data.match.tournament.name} | ${matchDate}`,
    description: `View detailed match results and player performances for ${data.match.tournament.name} on ${matchDate}`,
  };
}
