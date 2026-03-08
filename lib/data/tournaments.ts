import { prisma } from "@/lib/prisma";
import { logError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * Get all tournaments with error handling
 * @returns Array of tournaments with participant and match counts
 * @throws Error if database query fails
 */
export async function getAllTournaments() {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
    
    return tournaments;
  } catch (error) {
    logError(error, { function: 'getAllTournaments' });
    throw new Error('Failed to fetch tournaments. Please try again later.');
  }
}

/**
 * Get a single tournament by ID with error handling
 * @param id - Tournament ID as string
 * @returns Tournament object or null if not found
 * @throws ValidationError if ID is invalid
 * @throws Error if database query fails
 */
export async function getTournamentById(id: string) {
  const tournamentId = parseInt(id);
  
  if (isNaN(tournamentId) || tournamentId <= 0) {
    throw new ValidationError('Invalid tournament ID');
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });
    
    return tournament;
  } catch (error) {
    logError(error, { function: 'getTournamentById', tournamentId });
    throw new Error('Failed to fetch tournament. Please try again later.');
  }
}
