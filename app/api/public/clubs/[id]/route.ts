import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, NotFoundError, ValidationError } from "@/lib/errors";

// GET /api/public/clubs/[id] - Get club profile with members and tournaments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clubId = parseInt(id);

    if (isNaN(clubId)) {
      throw new ValidationError("Invalid club ID");
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        players: {
          include: {
            roles: {
              select: {
                role: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
        tournaments: {
          include: {
            _count: {
              select: {
                participants: true,
                matches: true,
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundError("Club");
    }

    // Get stats for each player
    const playersWithStats = await Promise.all(
      club.players.map(async (player) => {
        const stats = await prisma.tournamentPlayerStats.aggregate({
          where: {
            playerId: player.id,
          },
          _sum: {
            matchesPlayed: true,
            wins: true,
            totalPoints: true,
          },
        });

        const totalMatches = stats._sum.matchesPlayed || 0;
        const totalWins = stats._sum.wins || 0;
        const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

        return {
          id: player.id,
          name: player.name,
          photo: player.photo,
          roles: player.roles.map((r) => r.role),
          stats: {
            totalMatches,
            totalPoints: stats._sum.totalPoints || 0,
            winRate: Math.round(winRate * 100) / 100,
          },
        };
      })
    );

    // Transform tournaments
    const now = new Date();
    const tournaments = club.tournaments.map((tournament) => {
      let status: "upcoming" | "active" | "completed";
      if (tournament.startDate > now) {
        status = "upcoming";
      } else if (!tournament.endDate || tournament.endDate >= now) {
        status = "active";
      } else {
        status = "completed";
      }

      return {
        id: tournament.id,
        name: tournament.name,
        startDate: tournament.startDate.toISOString(),
        endDate: tournament.endDate?.toISOString() || null,
        participantCount: tournament._count.participants,
        matchCount: tournament._count.matches,
        status,
      };
    });

    // Calculate aggregate club stats
    const clubStats = await prisma.matchResult.aggregate({
      where: {
        player: {
          clubId: clubId,
        },
      },
      _sum: {
        goalsScored: true,
      },
      _count: {
        id: true,
      },
    });

    const totalMatches = await prisma.match.count({
      where: {
        tournament: {
          clubId: clubId,
        },
      },
    });

    const response = {
      club: {
        id: club.id,
        name: club.name,
        logo: club.logo,
        description: club.description,
        createdAt: club.createdAt.toISOString(),
      },
      players: playersWithStats,
      tournaments,
      stats: {
        totalPlayers: club.players.length,
        totalTournaments: club.tournaments.length,
        totalMatches,
        totalGoals: clubStats._sum.goalsScored || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}
