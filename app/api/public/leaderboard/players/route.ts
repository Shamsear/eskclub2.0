import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get('tournament');

    const where = tournamentId ? { match: { tournamentId: parseInt(tournamentId) } } : {};

    const results = await prisma.matchResult.groupBy({
      by: ['playerId'],
      where,
      _sum: {
        pointsEarned: true,
        goalsScored: true,
        goalsConceded: true,
      },
      _count: {
        id: true,
      },
    });

    const playerStats = await Promise.all(
      results.map(async (result) => {
        const player = await prisma.player.findUnique({
          where: { id: result.playerId },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        });

        if (!player) return null;

        const outcomes = await prisma.matchResult.groupBy({
          by: ['outcome'],
          where: {
            playerId: result.playerId,
            ...(tournamentId ? { match: { tournamentId: parseInt(tournamentId) } } : {}),
          },
          _count: {
            id: true,
          },
        });

        const wins = outcomes.find(o => o.outcome === 'WIN')?._count.id || 0;
        const draws = outcomes.find(o => o.outcome === 'DRAW')?._count.id || 0;
        const losses = outcomes.find(o => o.outcome === 'LOSS')?._count.id || 0;
        const totalMatches = result._count.id;
        const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

        return {
          player: {
            id: player.id,
            name: player.name,
            photo: player.photo,
            club: player.club,
          },
          stats: {
            totalMatches,
            totalWins: wins,
            totalDraws: draws,
            totalLosses: losses,
            totalGoalsScored: result._sum.goalsScored || 0,
            totalGoalsConceded: result._sum.goalsConceded || 0,
            totalPoints: result._sum.pointsEarned || 0,
            winRate,
          },
        };
      })
    );

    const filteredStats = playerStats.filter(s => s !== null);
    const sortedStats = filteredStats.sort((a, b) => b!.stats.totalPoints - a!.stats.totalPoints);

    return NextResponse.json({ players: sortedStats });
  } catch (error) {
    console.error('Error fetching players leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
