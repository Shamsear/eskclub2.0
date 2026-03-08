import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, NotFoundError, ValidationError } from "@/lib/errors";

// GET /api/public/tournaments/[id]/leaderboard - Get public tournament leaderboard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = parseInt(id);

    if (isNaN(tournamentId)) {
      throw new ValidationError("Invalid tournament ID");
    }

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!tournament) {
      throw new NotFoundError("Tournament");
    }

    // Get player statistics for the tournament
    const stats = await prisma.tournamentPlayerStats.findMany({
      where: { tournamentId },
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
      orderBy: [
        { totalPoints: "desc" },
        { goalsScored: "desc" },
        { goalsConceded: "asc" },
      ],
    });

    // Calculate goal difference and apply tiebreaker logic
    const leaderboardWithGoalDiff = stats.map((entry) => ({
      ...entry,
      goalDifference: entry.goalsScored - entry.goalsConceded,
    }));

    // Sort with proper tiebreaker: points > goal difference > goals scored
    leaderboardWithGoalDiff.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      return b.goalsScored - a.goalsScored;
    });

    // Format the response with rank
    const rankings = leaderboardWithGoalDiff.map((entry, index) => ({
      rank: index + 1,
      player: {
        id: entry.player.id,
        name: entry.player.name,
        photo: entry.player.photo,
        club: entry.player.club,
      },
      stats: {
        matchesPlayed: entry.matchesPlayed,
        wins: entry.wins,
        draws: entry.draws,
        losses: entry.losses,
        goalsScored: entry.goalsScored,
        goalsConceded: entry.goalsConceded,
        goalDifference: entry.goalDifference,
        totalPoints: entry.totalPoints,
      },
    }));

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
      },
      rankings,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
