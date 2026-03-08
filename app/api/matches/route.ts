import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/matches - Get all matches with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    
    if (tournamentId) {
      where.tournamentId = parseInt(tournamentId);
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            club: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        results: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                photo: true,
              },
            },
          },
        },
        teamResults: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            playerA: {
              select: {
                id: true,
                name: true,
                photo: true,
              },
            },
            playerB: {
              select: {
                id: true,
                name: true,
                photo: true,
              },
            },
          },
          orderBy: {
            teamPosition: 'asc',
          },
        },
        stage: {
          select: {
            id: true,
            stageName: true,
            stageOrder: true,
          },
        },
      },
      orderBy: {
        matchDate: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.match.count({ where });

    return NextResponse.json({
      matches,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
