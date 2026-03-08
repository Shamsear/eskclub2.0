import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, NotFoundError, ValidationError } from "@/lib/errors";

// GET /api/public/tournaments/[id] - Get detailed tournament data
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
            results: {
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
      throw new NotFoundError("Tournament");
    }

    // Calculate stats
    const completedMatches = tournament.matches.filter(
      (match) => match.results.length > 0
    ).length;

    const totalGoals = await prisma.matchResult.aggregate({
      where: {
        match: {
          tournamentId: tournamentId,
        },
      },
      _sum: {
        goalsScored: true,
      },
    });

    // Transform stages data
    const stages = tournament.pointSystemTemplate?.stagePoints.map((stage) => ({
      id: stage.id,
      name: stage.stageName,
      order: stage.stageOrder,
      matchCount: stage._count.matches,
    })) || [];

    // Build response
    const response = {
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
        totalGoals: totalGoals._sum.goalsScored || 0,
        participantCount: tournament._count.participants,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}
