import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clubSchema } from "@/lib/validations/club";
import { createErrorResponse, UnauthorizedError } from "@/lib/errors";

// GET /api/clubs - Get all clubs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new UnauthorizedError();
    }

    const clubs = await prisma.club.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    return NextResponse.json(clubs);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/clubs - Create a new club
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    
    // Validate request body using Zod schema
    const validationResult = clubSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { name, logo, description } = validationResult.data;

    const club = await prisma.club.create({
      data: {
        name,
        logo: logo || null,
        description: description || null,
      },
    });

    return NextResponse.json(club, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
