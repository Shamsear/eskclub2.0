import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get('tournament');

    const where = tournamentId ? { match: { tournamentId: parseInt(tournamentId) } } : {};

    // Get all clubs with their players' match results
    const clubs = await prisma.club.findMany({
      include: {
        players: {
          include: {
            matchResults: {
              where,
              include: {
                match: true,
              },
            },
          },
        },
      },
    });

    const teamStats = clubs.map(club => {
      const allResults = club.players.flatMap(player => player.matchResults);
      
      if (allResults.length === 0) {
        return {
          club: {
            id: club.id,
            name: club.name,
            logo: club.logo,
          },
          stats: {
            totalPlayers: club.players.length,
            totalMatches: 0,
            totalWins: 0,
            totalDraws: 0,
            totalLosses: 0,
            totalGoalsScored: 0,
            totalGoalsConceded: 0,
            totalPoints: 0,
            winRate: 0,
          },
        };
      }

      const totalMatches = allResults.length;
      const totalWins = allResults.filter(r => r.outcome === 'WIN').length;
      const totalDraws = allResults.filter(r => r.outcome === 'DRAW').length;
      const totalLosses = allResults.filter(r => r.outcome === 'LOSS').length;
      const totalGoalsScored = allResults.reduce((sum, r) => sum + r.goalsScored, 0);
      const totalGoalsConceded = allResults.reduce((sum, r) => sum + r.goalsConceded, 0);
      const totalPoints = allResults.reduce((sum, r) => sum + r.pointsEarned, 0);
      const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

      return {
        club: {
          id: club.id,
          name: club.name,
          logo: club.logo,
        },
        stats: {
          totalPlayers: club.players.length,
          totalMatches,
          totalWins,
          totalDraws,
          totalLosses,
          totalGoalsScored,
          totalGoalsConceded,
          totalPoints,
          winRate,
        },
      };
    });

    // Filter out teams with no matches and sort by points
    const filteredStats = teamStats.filter(team => team.stats.totalMatches > 0);
    const sortedStats = filteredStats.sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);

    return NextResponse.json({ teams: sortedStats });
  } catch (error) {
    console.error('Error fetching teams leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
