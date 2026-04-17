import { notFound } from 'next/navigation';
import PlayerProfileClient from '@/components/public/PlayerProfileClient';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPlayerData(id: number) {
  try {
    // Fetch player data and recent matches in parallel
    const [player, singlesMatches, teamMatches, tournamentStats, roles] = await Promise.all([
      prisma.player.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          place: true,
          dateOfBirth: true,
          photo: true,
          club: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      }),
      // Fetch singles matches
      prisma.matchResult.findMany({
        where: { playerId: id },
        include: {
          match: {
            select: {
              id: true,
              matchDate: true,
              stageName: true,
              isTeamMatch: true,
              tournament: {
                select: {
                  id: true,
                  name: true,
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
              },
            },
          },
        },
        orderBy: {
          match: {
            matchDate: 'desc',
          },
        },
        take: 10,
      }),
      // Fetch team matches (doubles)
      prisma.teamMatchResult.findMany({
        where: {
          OR: [
            { playerAId: id },
            { playerBId: id },
          ],
        },
        include: {
          match: {
            select: {
              id: true,
              matchDate: true,
              stageName: true,
              isTeamMatch: true,
              tournament: {
                select: {
                  id: true,
                  name: true,
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
          },
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
          match: {
            matchDate: 'desc',
          },
        },
        take: 10,
      }),
      // Fetch tournament stats
      prisma.tournamentPlayerStats.findMany({
        where: { playerId: id },
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
              startDate: true,
            },
          },
        },
      }),
      // Fetch player roles
      prisma.playerRole.findMany({
        where: { playerId: id },
        select: { role: true },
      }),
    ]);

    if (!player) {
      return null;
    }

    // Calculate overall stats from tournament stats (more efficient)
    const totalMatches = tournamentStats.reduce((sum, stat) => sum + stat.matchesPlayed, 0);
    const totalWins = tournamentStats.reduce((sum, stat) => sum + stat.wins, 0);
    const totalDraws = tournamentStats.reduce((sum, stat) => sum + stat.draws, 0);
    const totalLosses = tournamentStats.reduce((sum, stat) => sum + stat.losses, 0);
    const totalGoalsScored = tournamentStats.reduce((sum, stat) => sum + stat.goalsScored, 0);
    const totalGoalsConceded = tournamentStats.reduce((sum, stat) => sum + stat.goalsConceded, 0);
    const totalPoints = tournamentStats.reduce((sum, stat) => sum + stat.totalPoints, 0);

    // Process singles matches
    const processedSinglesMatches = singlesMatches.map(result => {
      const opponent = result.match.results.find(r => r.playerId !== id);
      
      return {
        id: result.id,
        matchId: result.match.id,
        date: result.match.matchDate.toISOString(),
        tournament: result.match.tournament,
        stageName: result.match.stageName,
        outcome: result.outcome as 'WIN' | 'DRAW' | 'LOSS',
        goalsScored: result.goalsScored,
        goalsConceded: result.goalsConceded,
        pointsEarned: result.pointsEarned,
        isTeamMatch: false,
        opponent: opponent && opponent.player ? {
          id: opponent.player.id,
          name: opponent.player.name,
          photo: opponent.player.photo,
          goalsScored: opponent.goalsScored,
          goalsConceded: opponent.goalsConceded,
        } : opponent ? {
          id: 0,
          name: 'External Player',
          photo: null,
          goalsScored: opponent.goalsScored,
          goalsConceded: opponent.goalsConceded,
        } : null,
      };
    });

    // Process team matches
    const processedTeamMatches = teamMatches.map(result => {
      // Find partner (the other player in the team)
      const partner = result.playerAId === id ? result.playerB : result.playerA;
      
      // Find opponent team (the other team in the match)
      const opponentTeam = result.match.teamResults?.find(
        tr => tr.playerAId !== id && tr.playerBId !== id
      );
      
      return {
        id: result.id,
        matchId: result.match.id,
        date: result.match.matchDate.toISOString(),
        tournament: result.match.tournament,
        stageName: result.match.stageName,
        outcome: result.outcome as 'WIN' | 'DRAW' | 'LOSS',
        goalsScored: result.goalsScored,
        goalsConceded: result.goalsConceded,
        pointsEarned: result.pointsEarned,
        isTeamMatch: true,
        partner: {
          id: partner.id,
          name: partner.name,
          photo: partner.photo,
        },
        club: result.club,
        opponentTeam: opponentTeam ? {
          club: opponentTeam.club,
          playerA: opponentTeam.playerA,
          playerB: opponentTeam.playerB,
          goalsScored: opponentTeam.goalsScored,
        } : null,
      };
    });

    // Combine and sort all matches by date
    const allMatches = [...processedSinglesMatches, ...processedTeamMatches]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone,
        place: player.place,
        dateOfBirth: player.dateOfBirth?.toISOString() || null,
        photo: player.photo,
        club: player.club || { id: 0, name: 'Free Agent', logo: null },
        roles: roles.map(r => r.role as 'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER'),
      },
      stats: {
        totalTournaments: tournamentStats.length,
        totalMatches,
        totalWins,
        totalDraws,
        totalLosses,
        totalGoalsScored,
        totalGoalsConceded,
        totalPoints,
        winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
      },
      recentMatches: allMatches,
      tournaments: tournamentStats.map(stat => ({
        id: stat.tournament.id,
        name: stat.tournament.name,
        startDate: stat.tournament.startDate?.toISOString() || new Date().toISOString(),
        rank: null, // Rank would need to be calculated separately
        totalPoints: stat.totalPoints,
      })),
    };
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const playerId = parseInt(id);

  if (isNaN(playerId)) {
    notFound();
  }

  const data = await getPlayerData(playerId);

  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PlayerProfileClient initialData={data} />
    </div>
  );
}
