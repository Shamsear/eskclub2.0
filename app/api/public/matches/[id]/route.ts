import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, NotFoundError, ValidationError } from "@/lib/errors";

// GET /api/public/matches/[id] - Get match details with results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      throw new ValidationError("Invalid match ID");
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
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
            pointsEarned: "desc",
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundError("Match");
    }

    // Transform results
    const results = match.results.map((result) => ({
      player: {
        id: result.player.id,
        name: result.player.name,
        photo: result.player.photo,
        club: result.player.club,
      },
      outcome: result.outcome,
      goalsScored: result.goalsScored,
      goalsConceded: result.goalsConceded,
      pointsEarned: result.pointsEarned,
      basePoints: result.basePoints,
      conditionalPoints: result.conditionalPoints,
    }));

    const response = {
      match: {
        id: match.id,
        date: match.matchDate.toISOString(),
        stageName: match.stageName,
        tournament: match.tournament,
      },
      results,
    };

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}
