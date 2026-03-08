import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { playerSchema } from "@/lib/validations/manager";
import { Prisma, RoleType } from "@prisma/client";

// GET /api/clubs/[id]/managers - Get all managers for a club
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const clubId = parseInt(id);
    
    if (isNaN(clubId)) {
      return NextResponse.json(
        { error: "Invalid club ID" },
        { status: 400 }
      );
    }

    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    // Get all players with MANAGER role
    const managers = await prisma.player.findMany({
      where: { 
        clubId,
        roles: {
          some: {
            role: RoleType.MANAGER
          }
        }
      },
      include: {
        roles: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(managers);
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching managers" },
      { status: 500 }
    );
  }
}

// POST /api/clubs/[id]/managers - Create a new manager for a club
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const clubId = parseInt(id);
    
    if (isNaN(clubId)) {
      return NextResponse.json(
        { error: "Invalid club ID" },
        { status: 400 }
      );
    }

    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Ensure MANAGER role is included
    if (!body.roles) {
      body.roles = [RoleType.MANAGER, RoleType.PLAYER];
    } else if (!body.roles.includes(RoleType.MANAGER)) {
      body.roles.push(RoleType.MANAGER);
    }
    
    // Ensure PLAYER role is always included
    if (!body.roles.includes(RoleType.PLAYER)) {
      body.roles.push(RoleType.PLAYER);
    }
    
    // Validate request body
    const validationResult = playerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, email, phone, place, dateOfBirth, photo, roles } = validationResult.data;

    // Generate email if not provided (required by schema unique constraint)
    const playerEmail = email && email.trim() !== ''
      ? email
      : `noemail_${Date.now()}_${Math.random().toString(36).substring(7)}@placeholder.local`;

    // Create player with roles
    const player = await prisma.player.create({
      data: {
        clubId,
        name,
        email: playerEmail,
        phone: phone || null,
        place: place || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        photo: photo || null,
        roles: {
          create: roles.map(role => ({ role }))
        }
      },
      include: {
        roles: true,
      }
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Error creating manager:", error);
    
    // Handle unique constraint violation for email
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A player with this email already exists" },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the manager" },
      { status: 500 }
    );
  }
}
