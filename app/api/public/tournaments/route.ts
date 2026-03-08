import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse } from "@/lib/errors";

// GET /api/public/tournaments - Get all tournaments with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    // Build where clause based on status filter
    const where: any = {};
    const now = new Date();

    if (status === "upcoming") {
      where.startDate = { gt: now };
    } else if (status === "active") {
      where.AND = [
        { startDate: { lte: now } },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ]
        }
      ];
    } else if (status === "completed") {
      where.endDate = { lt: now };
    }

    // Get tournaments with counts
    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        orderBy: {
          startDate: "desc",
        },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          _count: {
            select: {
              participants: true,
              matches: true,
            },
          },
        },
      }),
      prisma.tournament.count({ where }),
    ]);

    // Transform data for public API
    const transformedTournaments = tournaments.map((tournament) => {
      const startDate = tournament.startDate;
      const endDate = tournament.endDate;
      const now = new Date();

      let tournamentStatus: "upcoming" | "active" | "completed";
      if (startDate > now) {
        tournamentStatus = "upcoming";
      } else if (!endDate || endDate >= now) {
        tournamentStatus = "active";
      } else {
        tournamentStatus = "completed";
      }

      return {
        id: tournament.id,
        name: tournament.name,
        startDate: tournament.startDate.toISOString(),
        endDate: tournament.endDate?.toISOString() || null,
        participantCount: tournament._count.participants,
        matchCount: tournament._count.matches,
        status: tournamentStatus,
      };
    });

    return NextResponse.json({
      tournaments: transformedTournaments,
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
