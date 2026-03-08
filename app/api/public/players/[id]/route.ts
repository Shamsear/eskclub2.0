import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, NotFoundError, ValidationError } from "@/lib/errors";

// GET /api/public/players/[id] - Get player profile with statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);

    if (isNaN(playerId)) {
      throw new ValidationError("Invalid player ID");
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        roles: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!player) {
      throw new NotFoundError("Player");
    }

    // Get aggregated statistics across all tournaments
    const statsAggregation = await prisma.tournamentPlayerStats.aggregate({
      where: {
        playerId: playerId,
      },
      _sum: {
        matchesPlayed: true,
        wins: true,
        draws: true,
        losses: true,
        goalsScored: true,
        goalsConceded: true,
        totalPoints: true,
      },
      _count: {
        tournamentId: true,
      },
    });

    // Calculate win rate
    const totalMatches = statsAggregation._sum.matchesPlayed || 0;
    const totalWins = statsAggregation._sum.wins || 0;
    const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

    // Get recent matches (last 10)
    const recentMatches = await prisma.matchResult.findMany({
      where: {
        playerId: playerId,
      },
      include: {
        match: {
          select: {
            id: true,
            matchDate: true,
            tournament: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        match: {
          matchDate: "desc",
        },
      },
      take: 10,
    });

    // Get tournament participation with rankings
    const tournamentStats = await prisma.tournamentPlayerStats.findMany({
      where: {
        playerId: playerId,
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            startDate: true,
          },
        },
      },
      orderBy: {
        tournament: {
          startDate: "desc",
        },
      },
    });

    // Calculate rank for each tournament
    const tournaments = await Promise.all(
      tournamentStats.map(async (stat) => {
        // Get all players in this tournament ordered by points
        const allStats = await prisma.tournamentPlayerStats.findMany({
          where: {
            tournamentId: stat.tournamentId,
          },
          orderBy: [
            { totalPoints: "desc" },
            { goalsScored: "desc" },
            { goalsConceded: "asc" },
          ],
          select: {
            playerId: true,
          },
        });

        // Find player's rank
        const rank = allStats.findIndex((s) => s.playerId === playerId) + 1;

        return {
          id: stat.tournament.id,
          name: stat.tournament.name,
          startDate: stat.tournament.startDate.toISOString(),
          rank: rank > 0 ? rank : null,
          totalPoints: stat.totalPoints,
        };
      })
    );

    // Transform recent matches
    const transformedRecentMatches = recentMatches.map((result) => ({
      id: result.match.id,
      date: result.match.matchDate.toISOString(),
      tournament: result.match.tournament,
      outcome: result.outcome,
      goalsScored: result.goalsScored,
      goalsConceded: result.goalsConceded,
      pointsEarned: result.pointsEarned,
    }));

    const response = {
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone,
        place: player.place,
        dateOfBirth: player.dateOfBirth?.toISOString() || null,
        photo: player.photo,
        club: player.club,
        roles: player.roles.map((r) => r.role),
      },
      stats: {
        totalTournaments: statsAggregation._count.tournamentId,
        totalMatches: statsAggregation._sum.matchesPlayed || 0,
        totalWins: statsAggregation._sum.wins || 0,
        totalDraws: statsAggregation._sum.draws || 0,
        totalLosses: statsAggregation._sum.losses || 0,
        totalGoalsScored: statsAggregation._sum.goalsScored || 0,
        totalGoalsConceded: statsAggregation._sum.goalsConceded || 0,
        totalPoints: statsAggregation._sum.totalPoints || 0,
        winRate: Math.round(winRate * 100) / 100,
      },
      recentMatches: transformedRecentMatches,
      tournaments,
    };

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}
