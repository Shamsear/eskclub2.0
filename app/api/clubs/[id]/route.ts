import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clubUpdateSchema } from "@/lib/validations/club";
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError 
} from "@/lib/errors";

// GET /api/clubs/[id] - Get a single club by ID
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

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundError("Club");
    }

    return NextResponse.json(club);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PUT /api/clubs/[id] - Update a club
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
    const clubId = parseInt(id);
    
    if (isNaN(clubId)) {
      throw new ValidationError("Invalid club ID");
    }

    const body = await request.json();
    
    // Validate request body using Zod schema
    const validationResult = clubUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw validationResult.error;
    }

    // Check if club exists
    const existingClub = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!existingClub) {
      throw new NotFoundError("Club");
    }

    const { name, logo, description } = validationResult.data;

    const club = await prisma.club.update({
      where: { id: clubId },
      data: {
        ...(name !== undefined && { name }),
        ...(logo !== undefined && { logo }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(club);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// DELETE /api/clubs/[id] - Delete a club
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
    const clubId = parseInt(id);
    
    if (isNaN(clubId)) {
      throw new ValidationError("Invalid club ID");
    }

    // Check if club exists
    const existingClub = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!existingClub) {
      throw new NotFoundError("Club");
    }

    // Check if club has members (optional warning - cascade delete will handle it)
    const totalMembers = existingClub._count.players;

    // Delete the club (cascade will delete all related members)
    await prisma.club.delete({
      where: { id: clubId },
    });

    return NextResponse.json(
      { 
        message: "Club deleted successfully",
        deletedMembers: totalMembers 
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}