import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tournaments/[id]/stages - Get available stages for a tournament
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
    const tournamentId = parseInt(id);
    
    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: "Invalid tournament ID" },
        { status: 400 }
      );
    }

    // Get tournament with its point system template
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        pointSystemTemplate: {
          include: {
            stagePoints: {
              orderBy: {
                stageOrder: 'asc'
              }
            }
          }
        }
      }
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // If tournament has a point system template with stages, return them
    if (tournament.pointSystemTemplate?.stagePoints) {
      return NextResponse.json({
        stages: tournament.pointSystemTemplate.stagePoints.map(stage => ({
          id: stage.stageId,
          name: stage.stageName,
          order: stage.stageOrder,
          pointsPerWin: stage.pointsPerWin,
          pointsPerDraw: stage.pointsPerDraw,
          pointsPerLoss: stage.pointsPerLoss,
          pointsPerGoalScored: stage.pointsPerGoalScored,
          pointsPerGoalConceded: stage.pointsPerGoalConceded,
        }))
      });
    }

    // If no stages defined, return empty array
    return NextResponse.json({ stages: [] });
    
  } catch (error) {
    console.error("Error fetching tournament stages:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
