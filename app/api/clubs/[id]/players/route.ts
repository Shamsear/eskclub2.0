import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { playerSchema } from "@/lib/validations/manager";
import { Prisma, RoleType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// GET /api/clubs/[id]/players?role=ROLE - Get all players for a club, optionally filtered by role
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

    // Get role filter from query params
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role') as RoleType | null;

    // Build where clause
    const whereClause: any = { clubId };
    
    if (roleFilter && Object.values(RoleType).includes(roleFilter)) {
      whereClause.roles = {
        some: {
          role: roleFilter
        }
      };
    }

    // Get players
    const players = await prisma.player.findMany({
      where: whereClause,
      include: {
        roles: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching players" },
      { status: 500 }
    );
  }
}

// POST /api/clubs/[id]/players - Create a new player for a club
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
    
    // Ensure PLAYER role is always included
    if (!body.roles) {
      body.roles = [RoleType.PLAYER];
    } else if (!body.roles.includes(RoleType.PLAYER)) {
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
        club: true,
      }
    });

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/clubs/${clubId}`);
    
    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    
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
      { error: "An unexpected error occurred while creating the player" },
      { status: 500 }
    );
  }
}
