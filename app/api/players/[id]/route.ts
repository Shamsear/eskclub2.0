import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { playerSchema } from "@/lib/validations/manager";
import { Prisma, RoleType } from "@prisma/client";

// GET /api/players/[id] - Get a single player by ID
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
    const playerId = parseInt(id);
    
    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: "Invalid player ID" },
        { status: 400 }
      );
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        roles: true,
        club: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching the player" },
      { status: 500 }
    );
  }
}

// PUT /api/players/[id] - Update a player
export async function PUT(
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
    const playerId = parseInt(id);
    
    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: "Invalid player ID" },
        { status: 400 }
      );
    }

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        roles: true,
      },
    });

    if (!existingPlayer) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Ensure PLAYER role is always included
    if (body.roles && !body.roles.includes(RoleType.PLAYER)) {
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

    // Update player and roles in a transaction
    const updatedPlayer = await prisma.$transaction(async (tx) => {
      // Update player data
      const player = await tx.player.update({
        where: { id: playerId },
        data: {
          name,
          email,
          phone: phone || null,
          place: place || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          photo: photo || null,
        },
      });

      // Delete existing roles
      await tx.playerRole.deleteMany({
        where: { playerId },
      });

      // Create new roles
      await tx.playerRole.createMany({
        data: roles.map(role => ({
          playerId,
          role,
        })),
      });

      // Fetch updated player with roles
      return await tx.player.findUnique({
        where: { id: playerId },
        include: {
          roles: true,
          club: true,
        },
      });
    });

    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error("Error updating player:", error);
    
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
      { error: "An unexpected error occurred while updating the player" },
      { status: 500 }
    );
  }
}

// DELETE /api/players/[id] - Delete a player
export async function DELETE(
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
    const playerId = parseInt(id);
    
    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: "Invalid player ID" },
        { status: 400 }
      );
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    // Delete player (roles will be cascade deleted)
    await prisma.player.delete({
      where: { id: playerId },
    });

    return NextResponse.json(
      { message: "Player deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting the player" },
      { status: 500 }
    );
  }
}
