import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transfers = await prisma.playerTransfer.findMany({
      include: {
        player: true,
        fromClub: true,
        toClub: true,
      },
      orderBy: {
        transferDate: "desc",
      },
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { playerId, toClubId, notes } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    // Get current player data
    const player = await prisma.player.findUnique({
      where: { id: parseInt(playerId) },
      include: {
        clubStats: {
          where: { leftAt: null },
        },
      },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    const fromClubId = player.clubId;
    const transferDate = new Date();

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Close current club stats period
      if (player.clubStats.length > 0) {
        await tx.playerClubStats.update({
          where: { id: player.clubStats[0].id },
          data: { leftAt: transferDate },
        });
      }

      // Create transfer record
      const transfer = await tx.playerTransfer.create({
        data: {
          playerId: parseInt(playerId),
          fromClubId,
          toClubId: toClubId ? parseInt(toClubId) : null,
          transferDate,
          notes,
        },
      });

      // Update player's current club
      await tx.player.update({
        where: { id: parseInt(playerId) },
        data: {
          clubId: toClubId ? parseInt(toClubId) : null,
          isFreeAgent: !toClubId,
        },
      });

      // Create new club stats period
      await tx.playerClubStats.create({
        data: {
          playerId: parseInt(playerId),
          clubId: toClubId ? parseInt(toClubId) : null,
          joinedAt: transferDate,
        },
      });

      return transfer;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
