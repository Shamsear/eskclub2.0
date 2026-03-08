import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalculateTournamentStatistics } from "@/lib/match-utils";
import {
  createErrorResponse,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";

/**
 * POST /api/tournaments/[id]/recalculate-stats
 * Recalculate all player statistics for a tournament
 */
export async function POST(
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

    // Recalculate all statistics
    await recalculateTournamentStatistics(tournamentId);

    return NextResponse.json({
      success: true,
      message: `Statistics recalculated for ${tournament.name}`,
      tournament: {
        id: tournament.id,
        name: tournament.name,
        participants: tournament._count.participants,
        matches: tournament._count.matches,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
