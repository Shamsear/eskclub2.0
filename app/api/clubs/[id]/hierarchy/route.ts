import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

// GET /api/clubs/[id]/hierarchy - Get club organizational structure
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

    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    // Get all players for this club with their roles
    const allPlayers = await prisma.player.findMany({
      where: { clubId },
      include: {
        roles: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Separate players by their roles
    const managers = allPlayers.filter(p => 
      p.roles.some(r => r.role === RoleType.MANAGER)
    );
    
    const mentors = allPlayers.filter(p => 
      p.roles.some(r => r.role === RoleType.MENTOR)
    );
    
    const captains = allPlayers.filter(p => 
      p.roles.some(r => r.role === RoleType.CAPTAIN)
    );
    
    // Players are those with PLAYER role (which should be everyone, but filter for clarity)
    const players = allPlayers.filter(p => 
      p.roles.some(r => r.role === RoleType.PLAYER)
    );

    return NextResponse.json({
      club: {
        id: club.id,
        name: club.name,
        logo: club.logo,
        description: club.description,
        createdAt: club.createdAt,
        updatedAt: club.updatedAt,
      },
      managers,
      mentors,
      captains,
      players,
    });
  } catch (error) {
    console.error("Error fetching club hierarchy:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching the club hierarchy" },
      { status: 500 }
    );
  }
}
