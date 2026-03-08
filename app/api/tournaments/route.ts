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

// GET /api/tournaments - Get all tournaments (system-wide)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new UnauthorizedError();
    }

    const tournaments = await prisma.tournament.findMany({
      orderBy: {
        startDate: "desc",
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
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
      // Add a reasonable limit to prevent performance issues with large datasets
      take: 1000,
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/tournaments - Create a new admin-hosted tournament
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new UnauthorizedError();
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
        clubId: null, // Admin-hosted tournaments don't have a club
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
