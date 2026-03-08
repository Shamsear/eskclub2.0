import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError 
} from "@/lib/errors";

// GET /api/tournaments/[id]/leaderboard - Get tournament leaderboard
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
      throw new ValidationError("Invalid tournament ID");
    }

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        name: true,
        pointsPerWin: true,
        pointsPerDraw: true,
        pointsPerLoss: true,
        pointsPerGoalScored: true,
        pointsPerGoalConceded: true,
      },
    });

    if (!tournament) {
      throw new NotFoundError("Tournament");
    }

    // Get player statistics for the tournament, ordered by total points
    const leaderboard = await prisma.tournamentPlayerStats.findMany({
      where: { tournamentId },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
      },
      orderBy: [
        { totalPoints: "desc" },
        { goalsScored: "desc" },
        { wins: "desc" },
      ],
    });

    // Format the response with rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      player: entry.player,
      stats: {
        matchesPlayed: entry.matchesPlayed,
        wins: entry.wins,
        draws: entry.draws,
        losses: entry.losses,
        goalsScored: entry.goalsScored,
        goalsConceded: entry.goalsConceded,
        totalPoints: entry.totalPoints,
        conditionalPoints: entry.conditionalPoints,
      },
      updatedAt: entry.updatedAt,
    }));

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        pointSystem: {
          pointsPerWin: tournament.pointsPerWin,
          pointsPerDraw: tournament.pointsPerDraw,
          pointsPerLoss: tournament.pointsPerLoss,
          pointsPerGoalScored: tournament.pointsPerGoalScored,
          pointsPerGoalConceded: tournament.pointsPerGoalConceded,
        },
      },
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
