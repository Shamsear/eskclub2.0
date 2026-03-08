import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'club', 'player', or undefined for all

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        clubs: [],
        players: []
      });
    }

    const searchTerm = query.trim();

    // Search clubs
    let clubs: any[] = [];
    if (!type || type === 'club') {
      clubs = await prisma.club.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          _count: {
            select: { players: true }
          }
        },
        take: 10
      });
    }

    // Search players (team members with all roles)
    let players: any[] = [];
    if (!type || type === 'player') {
      players = await prisma.player.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { place: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          club: {
            select: {
              id: true,
              name: true
            }
          },
          roles: {
            select: {
              id: true,
              role: true,
              createdAt: true
            }
          }
        },
        take: 20
      });
    }

    return NextResponse.json({
      clubs,
      players
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching' },
      { status: 500 }
    );
  }
}
