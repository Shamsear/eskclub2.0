import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  createErrorResponse, 
  UnauthorizedError 
} from "@/lib/errors";

// GET /api/players - Get all players from all clubs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new UnauthorizedError();
    }

    const players = await prisma.player.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return NextResponse.json(players);
  } catch (error) {
    return createErrorResponse(error);
  }
}
