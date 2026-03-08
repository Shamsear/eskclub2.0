import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse } from "@/lib/errors";

// GET /api/public/players - Get all players with basic information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";
    const clubId = searchParams.get("clubId");
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { place: { contains: search, mode: "insensitive" } },
      ];
    }

    if (clubId) {
      where.clubId = parseInt(clubId);
    }

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        orderBy: {
          name: "asc",
        },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          photo: true,
          place: true,
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
      }),
      prisma.player.count({ where }),
    ]);

    // Get aggregated statistics for each player
    const playersWithStats = await Promise.all(
      players.map(async (player) => {
        const statsAggregation = await prisma.tournamentPlayerStats.aggregate({
          where: {
            playerId: player.id,
          },
          _sum: {
            matchesPlayed: true,
            wins: true,
            totalPoints: true,
            goalsScored: true,
          },
        });

        const totalMatches = statsAggregation._sum.matchesPlayed || 0;
        const totalWins = statsAggregation._sum.wins || 0;
        const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

        return {
          id: player.id,
          name: player.name,
          photo: player.photo,
          place: player.place,
          club: player.club,
          roles: player.roles.map((r) => r.role),
          stats: {
            totalMatches,
            totalPoints: statsAggregation._sum.totalPoints || 0,
            totalGoalsScored: statsAggregation._sum.goalsScored || 0,
            winRate: Math.round(winRate * 100) / 100,
          },
        };
      })
    );

    return NextResponse.json({
      players: playersWithStats,
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
