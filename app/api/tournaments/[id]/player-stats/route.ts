import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, UnauthorizedError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const tournamentId = parseInt(id);

    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: "Invalid tournament ID" },
        { status: 400 }
      );
    }

    // Get tournament stats for all players
    const tournamentStats = await prisma.tournamentPlayerStats.findMany({
      where: {
        tournamentId,
        matchesPlayed: {
          gt: 0, // Only include players who have played matches
        },
      },
      include: {
        player: {
          include: {
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
    });

    // Transform the data to match the Player interface
    const players = tournamentStats.map((stat) => {
      const winRate = stat.matchesPlayed > 0 
        ? ((stat.wins / stat.matchesPlayed) * 100) 
        : 0;
      const avgPointsPerMatch = stat.matchesPlayed > 0 
        ? (stat.totalPoints / stat.matchesPlayed) 
        : 0;
      const avgGoalsPerMatch = stat.matchesPlayed > 0 
        ? (stat.goalsScored / stat.matchesPlayed) 
        : 0;
      const goalDifference = stat.goalsScored - stat.goalsConceded;

      return {
        id: stat.player.id,
        name: stat.player.name,
        email: stat.player.email,
        photo: stat.player.photo,
        club: stat.player.club,
        totalPoints: stat.totalPoints,
        totalMatches: stat.matchesPlayed,
        totalWins: stat.wins,
        totalDraws: stat.draws,
        totalLosses: stat.losses,
        totalGoalsScored: stat.goalsScored,
        totalGoalsConceded: stat.goalsConceded,
        goalDifference,
        winRate: parseFloat(winRate.toFixed(1)),
        avgPointsPerMatch: parseFloat(avgPointsPerMatch.toFixed(2)),
        avgGoalsPerMatch: parseFloat(avgGoalsPerMatch.toFixed(2)),
        tournamentsPlayed: 1, // For a specific tournament, it's always 1
      };
    });

    // Sort by total points, then win rate, then goal difference
    players.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.goalDifference - a.goalDifference;
    });

    return NextResponse.json({
      success: true,
      players,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
