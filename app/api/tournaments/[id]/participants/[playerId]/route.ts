import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError,
} from "@/lib/errors";

// DELETE /api/tournaments/[id]/participants/[playerId] - Remove a participant from a tournament
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new UnauthorizedError();
    }

    const { id, playerId } = await params;
    const tournamentId = parseInt(id);
    const playerIdNum = parseInt(playerId);
    
    if (isNaN(tournamentId)) {
      throw new ValidationError("Invalid tournament ID");
    }
    
    if (isNaN(playerIdNum)) {
      throw new ValidationError("Invalid player ID");
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

    // Check if participant exists
    const participant = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_playerId: {
          tournamentId,
          playerId: playerIdNum,
        },
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!participant) {
      throw new NotFoundError("Participant not found in this tournament");
    }

    // Check if player has existing match results
    const matchResults = await prisma.matchResult.findMany({
      where: {
        playerId: playerIdNum,
        match: {
          tournamentId,
        },
      },
      include: {
        match: {
          select: {
            id: true,
            matchDate: true,
          },
        },
      },
    });

    const hasMatchResults = matchResults.length > 0;
    const matchCount = matchResults.length;

    // If player has match results, delete them first and include warning in response
    if (hasMatchResults) {
      // Use a transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        // Delete match results first
        await tx.matchResult.deleteMany({
          where: {
            playerId: playerIdNum,
            match: {
              tournamentId,
            },
          },
        });

        // Delete tournament stats if they exist
        await tx.tournamentPlayerStats.deleteMany({
          where: {
            tournamentId,
            playerId: playerIdNum,
          },
        });

        // Finally, delete the participant
        await tx.tournamentParticipant.delete({
          where: {
            tournamentId_playerId: {
              tournamentId,
              playerId: playerIdNum,
            },
          },
        });
      });

      return NextResponse.json(
        {
          message: `Participant ${participant.player.name} removed from tournament`,
          warning: `This player had ${matchCount} match result(s) which have been deleted`,
          deletedMatchResults: matchCount,
        },
        { status: 200 }
      );
    }

    // Delete the participant (no match results to worry about)
    await prisma.tournamentParticipant.delete({
      where: {
        tournamentId_playerId: {
          tournamentId,
          playerId: playerIdNum,
        },
      },
    });

    return NextResponse.json(
      {
        message: `Participant ${participant.player.name} removed from tournament`,
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
