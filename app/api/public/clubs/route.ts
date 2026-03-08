import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse } from "@/lib/errors";

// GET /api/public/clubs - Get all clubs with basic information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        orderBy: {
          name: "asc",
        },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          logo: true,
          description: true,
          _count: {
            select: {
              players: true,
              tournaments: true,
            },
          },
        },
      }),
      prisma.club.count(),
    ]);

    // Get achievements for each club (tournament wins, top scorers, etc.)
    const clubsWithAchievements = await Promise.all(
      clubs.map(async (club) => {
        // Count tournament wins (tournaments hosted by this club that are completed)
        const tournamentWins = await prisma.tournament.count({
          where: {
            clubId: club.id,
            endDate: {
              lt: new Date(),
            },
          },
        });

        // Get top scorer from this club across all tournaments
        const topScorer = await prisma.tournamentPlayerStats.findFirst({
          where: {
            player: {
              clubId: club.id,
            },
          },
          orderBy: {
            goalsScored: "desc",
          },
          select: {
            goalsScored: true,
          },
        });

        // Determine achievements
        const achievements: Array<{
          type: "tournament_win" | "top_scorer" | "most_active";
          label: string;
        }> = [];

        if (tournamentWins > 0) {
          achievements.push({
            type: "tournament_win",
            label: `${tournamentWins} Tournament${tournamentWins > 1 ? "s" : ""} Hosted`,
          });
        }

        if (topScorer && topScorer.goalsScored > 10) {
          achievements.push({
            type: "top_scorer",
            label: `Top Scorer: ${topScorer.goalsScored} Goals`,
          });
        }

        if (club._count.players > 20) {
          achievements.push({
            type: "most_active",
            label: "Active Community",
          });
        }

        return {
          id: club.id,
          name: club.name,
          logo: club.logo,
          description: club.description,
          playerCount: club._count.players,
          tournamentCount: club._count.tournaments,
          achievements,
        };
      })
    );

    return NextResponse.json({
      clubs: clubsWithAchievements,
      pagination: {
        page,
        pageSize,
        total,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
