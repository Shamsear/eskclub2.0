import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { playerUpdateSchema } from "@/lib/validations/manager";
import { Prisma, RoleType } from "@prisma/client";
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError 
} from "@/lib/errors";

// GET /api/managers/[id] - Get a single manager by ID
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
    const playerId = parseInt(id);
    
    if (isNaN(playerId)) {
      throw new ValidationError("Invalid manager ID");
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        club: true,
        roles: true,
      },
    });

    if (!player) {
      throw new NotFoundError("Manager");
    }

    // Check if player has MANAGER role
    const hasManagerRole = player.roles.some(r => r.role === RoleType.MANAGER);
    if (!hasManagerRole) {
      throw new NotFoundError("Manager");
    }

    return NextResponse.json(player);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PUT /api/managers/[id] - Update a manager
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
    const playerId = parseInt(id);
    
    if (isNaN(playerId)) {
      throw new ValidationError("Invalid manager ID");
    }

    const body = await request.json();
    
    // Validate request body using Zod schema
    const validationResult = playerUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw validationResult.error;
    }

    // Check if player exists and has MANAGER role
    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
      include: { roles: true },
    });

    if (!existingPlayer) {
      throw new NotFoundError("Manager");
    }

    const hasManagerRole = existingPlayer.roles.some(r => r.role === RoleType.MANAGER);
    if (!hasManagerRole) {
      throw new NotFoundError("Manager");
    }

    const { name, email, phone, place, dateOfBirth, photo, roles } = validationResult.data;

    // Update player data and roles if provided
    const player = await prisma.player.update({
      where: { id: playerId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(place !== undefined && { place }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(photo !== undefined && { photo }),
      },
      include: {
        roles: true,
        club: true,
      }
    });

    // Update roles if provided
    if (roles !== undefined) {
      // Ensure MANAGER and PLAYER roles are always included
      const roleSet = new Set([...roles, RoleType.MANAGER, RoleType.PLAYER]);
      const updatedRoles = Array.from(roleSet);
      
      // Delete existing roles
      await prisma.playerRole.deleteMany({
        where: { playerId },
      });
      
      // Create new roles
      await prisma.playerRole.createMany({
        data: updatedRoles.map(role => ({ playerId, role })),
      });
    }

    // Fetch updated player with roles
    const updatedPlayer = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        roles: true,
        club: true,
      },
    });

    return NextResponse.json(updatedPlayer);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// DELETE /api/managers/[id] - Delete a manager (remove MANAGER role)
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
    const playerId = parseInt(id);
    
    if (isNaN(playerId)) {
      throw new ValidationError("Invalid manager ID");
    }

    // Check if player exists and has MANAGER role
    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
      include: { roles: true },
    });

    if (!existingPlayer) {
      throw new NotFoundError("Manager");
    }

    const hasManagerRole = existingPlayer.roles.some(r => r.role === RoleType.MANAGER);
    if (!hasManagerRole) {
      throw new NotFoundError("Manager");
    }

    // Remove MANAGER role
    await prisma.playerRole.deleteMany({
      where: {
        playerId,
        role: RoleType.MANAGER,
      },
    });

    // If player only has PLAYER role left, optionally delete the player entirely
    const remainingRoles = await prisma.playerRole.findMany({
      where: { playerId },
    });

    if (remainingRoles.length === 1 && remainingRoles[0].role === RoleType.PLAYER) {
      // Player only has PLAYER role, you might want to keep them or delete
      // For now, we'll keep them as a regular player
    }

    return NextResponse.json(
      { message: "Manager role removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
