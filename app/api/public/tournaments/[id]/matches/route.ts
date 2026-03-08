import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = parseInt(id);

    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID' },
        { status: 400 }
      );
    }

    // Get tournament
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Get all matches for this tournament with results
    const matches = await prisma.match.findMany({
      where: {
        tournamentId: tournamentId,
      },
      include: {
        stage: {
          select: {
            id: true,
            stageName: true,
            stageOrder: true,
          },
        },
        results: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                photo: true,
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
      orderBy: [
        { matchDate: 'asc' },
      ],
    });

    // Transform matches to the expected format
    const transformedMatches = matches.map((match) => {
      const player1Result = match.results[0];
      const player2Result = match.results[1];
      
      // Determine status based on results
      let status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 'SCHEDULED';
      
      // Match is completed if both players have results with outcome set
      if (player1Result && player2Result && 
          player1Result.outcome && player2Result.outcome) {
        status = 'COMPLETED';
      } else if (match.walkoverWinnerId !== null && match.walkoverWinnerId !== undefined) {
        status = 'CANCELLED';
      }
      
      // Determine winner
      let winner = null;
      if (status === 'COMPLETED' && player1Result && player2Result) {
        if (player1Result.outcome === 'WIN') {
          winner = player1Result.player;
        } else if (player2Result.outcome === 'WIN') {
          winner = player2Result.player;
        }
      } else if (match.walkoverWinnerId && match.walkoverWinnerId > 0) {
        const winnerResult = match.results.find(r => r.playerId === match.walkoverWinnerId);
        if (winnerResult) {
          winner = winnerResult.player;
        }
      }

      return {
        id: match.id,
        date: match.matchDate.toISOString(),
        stage: match.stage ? {
          id: match.stage.id,
          name: match.stage.stageName,
        } : {
          id: 0,
          name: match.stageName || 'General',
        },
        player1: player1Result ? player1Result.player : null,
        player2: player2Result ? player2Result.player : null,
        player1Score: player1Result ? player1Result.goalsScored : null,
        player2Score: player2Result ? player2Result.goalsScored : null,
        winner,
        status,
      };
    });

    return NextResponse.json({
      tournament,
      matches: transformedMatches,
    });
  } catch (error) {
    console.error('Error fetching tournament matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament matches' },
      { status: 500 }
    );
  }
}
