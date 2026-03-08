import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError,
  ConflictError,
} from "@/lib/errors";

// Validation schema for adding participants
const addParticipantsSchema = z.object({
  playerIds: z.array(z.number().int().positive()).min(1, "At least one player ID is required"),
});

// GET /api/tournaments/[id]/participants - Get all participants for a tournament
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
      select: { id: true },
    });

    if (!tournament) {
      throw new NotFoundError("Tournament");
    }

    // Get all participants
    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            place: true,
            dateOfBirth: true,
            photo: true,
            clubId: true,
            club: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        player: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(participants);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/tournaments/[id]/participants - Add participants to a tournament
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

    const body = await request.json();
    
    // Validate request body
    const validationResult = addParticipantsSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { playerIds } = validationResult.data;

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

    // Verify all players exist (players can be from any club for admin-hosted tournaments)
    const players = await prisma.player.findMany({
      where: {
        id: { in: playerIds },
      },
      select: {
        id: true,
        name: true,
        clubId: true,
      },
    });

    if (players.length !== playerIds.length) {
      const foundIds = players.map(p => p.id);
      const missingIds = playerIds.filter(id => !foundIds.includes(id));
      throw new NotFoundError(`Player(s) with ID(s) ${missingIds.join(", ")}`);
    }

    // Check for existing participants
    const existingParticipants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        playerId: { in: playerIds },
      },
      include: {
        player: {
          select: {
            name: true,
          },
        },
      },
    });

    if (existingParticipants.length > 0) {
      const duplicateNames = existingParticipants.map(p => p.player.name).join(", ");
      throw new ConflictError(
        `Player(s) ${duplicateNames} are already participants in this tournament`
      );
    }

    // Add participants
    const participantsData = playerIds.map(playerId => ({
      tournamentId,
      playerId,
    }));

    await prisma.tournamentParticipant.createMany({
      data: participantsData,
    });

    // Fetch the newly created participants with player details
    const newParticipants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        playerId: { in: playerIds },
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            place: true,
            dateOfBirth: true,
            photo: true,
            clubId: true,
            club: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: `Successfully added ${newParticipants.length} participant(s) to the tournament`,
        participants: newParticipants,
      },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
