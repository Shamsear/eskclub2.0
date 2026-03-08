import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tournamentUpdateSchema } from "@/lib/validations/tournament";
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError 
} from "@/lib/errors";

// GET /api/tournaments/[id] - Get a single tournament by ID
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
          include: {
            conditionalRules: true,
          },
        },
        participants: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                photo: true,
                club: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        matches: {
          include: {
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
          },
          orderBy: {
            matchDate: "desc",
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

    return NextResponse.json(tournament);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PUT /api/tournaments/[id] - Update a tournament
export async function PUT(
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
    
    // Validate request body using Zod schema
    const validationResult = tournamentUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw validationResult.error;
    }

    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!existingTournament) {
      throw new NotFoundError("Tournament");
    }

    const { 
      name, 
      description, 
      startDate, 
      endDate,
      matchFormat,
      pointSystemTemplateId,
      pointsPerWin,
      pointsPerDraw,
      pointsPerLoss,
      pointsPerGoalScored,
      pointsPerGoalConceded,
    } = validationResult.data;

    // Validate template exists if provided
    if (pointSystemTemplateId !== undefined && pointSystemTemplateId !== null) {
      const template = await prisma.pointSystemTemplate.findUnique({
        where: { id: pointSystemTemplateId },
      });

      if (!template) {
        throw new NotFoundError("Point system template");
      }
    }

    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(matchFormat !== undefined && { matchFormat }),
        ...(pointSystemTemplateId !== undefined && { pointSystemTemplateId }),
        ...(pointsPerWin !== undefined && { pointsPerWin }),
        ...(pointsPerDraw !== undefined && { pointsPerDraw }),
        ...(pointsPerLoss !== undefined && { pointsPerLoss }),
        ...(pointsPerGoalScored !== undefined && { pointsPerGoalScored }),
        ...(pointsPerGoalConceded !== undefined && { pointsPerGoalConceded }),
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
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

    return NextResponse.json(tournament);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// DELETE /api/tournaments/[id] - Delete a tournament
export async function DELETE(
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
    const existingTournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });

    if (!existingTournament) {
      throw new NotFoundError("Tournament");
    }

    const participantCount = existingTournament._count.participants;
    const matchCount = existingTournament._count.matches;

    // Delete the tournament (cascade will delete all related data)
    await prisma.tournament.delete({
      where: { id: tournamentId },
    });

    return NextResponse.json(
      { 
        message: "Tournament deleted successfully",
        deletedParticipants: participantCount,
        deletedMatches: matchCount,
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
