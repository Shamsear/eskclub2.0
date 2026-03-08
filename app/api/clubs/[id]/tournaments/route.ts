import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tournamentSchema } from "@/lib/validations/tournament";
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError 
} from "@/lib/errors";

// GET /api/clubs/[id]/tournaments - Get all tournaments for a club
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
    const clubId = parseInt(id);
    
    if (isNaN(clubId)) {
      throw new ValidationError("Invalid club ID");
    }

    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundError("Club");
    }

    const tournaments = await prisma.tournament.findMany({
      where: { clubId },
      orderBy: {
        startDate: "desc",
      },
      include: {
        pointSystemTemplate: {
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

    return NextResponse.json(tournaments);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/clubs/[id]/tournaments - Create a new tournament for a club
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
    const clubId = parseInt(id);
    
    if (isNaN(clubId)) {
      throw new ValidationError("Invalid club ID");
    }

    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundError("Club");
    }

    const body = await request.json();
    
    // Validate request body using Zod schema
    const validationResult = tournamentSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw validationResult.error;
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
    if (pointSystemTemplateId) {
      const template = await prisma.pointSystemTemplate.findUnique({
        where: { id: pointSystemTemplateId },
      });

      if (!template) {
        throw new NotFoundError("Point system template");
      }
    }

    const tournament = await prisma.tournament.create({
      data: {
        clubId,
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        matchFormat,
        pointSystemTemplateId: pointSystemTemplateId || null,
        pointsPerWin,
        pointsPerDraw,
        pointsPerLoss,
        pointsPerGoalScored,
        pointsPerGoalConceded,
      },
      include: {
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
