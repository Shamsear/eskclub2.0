import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { cache, cacheKeys, cacheTTL } from "@/lib/cache";

export async function getClub(id: string): Promise<{
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
} | null> {
  const clubId = parseInt(id);
  
  if (isNaN(clubId)) {
    return null;
  }

  // Check cache first
  const cacheKey = cacheKeys.club(clubId);
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached as any;
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });

  // Cache the result
  if (club) {
    cache.set(cacheKey, club, cacheTTL.medium);
  }

  return club;
}

export async function getClubBasic(id: string): Promise<{ id: number; name: string } | null> {
  const clubId = parseInt(id);
  
  if (isNaN(clubId)) {
    return null;
  }

  // Check cache first
  const cacheKey = `${cacheKeys.club(clubId)}:basic`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached as { id: number; name: string };
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      name: true,
    },
  });

  // Cache the result
  if (club) {
    cache.set(cacheKey, club, cacheTTL.long);
  }

  return club;
}

export async function getClubHierarchy(id: string): Promise<any> {
  const clubId = parseInt(id);
  
  if (isNaN(clubId)) {
    return null;
  }

  // Check cache first
  const cacheKey = cacheKeys.clubHierarchy(clubId);
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached as any;
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });

  if (!club) {
    return null;
  }

  const [allPlayers, tournamentsCount] = await Promise.all([
    prisma.player.findMany({
      where: { clubId },
      include: {
        roles: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.tournament.count({
      where: { clubId },
    }),
  ]);

  const managers = allPlayers.filter(p => 
    p.roles.some(r => r.role === RoleType.MANAGER)
  );
  
  const mentors = allPlayers.filter(p => 
    p.roles.some(r => r.role === RoleType.MENTOR)
  );
  
  const captains = allPlayers.filter(p => 
    p.roles.some(r => r.role === RoleType.CAPTAIN)
  );
  
  const players = allPlayers.filter(p => 
    p.roles.some(r => r.role === RoleType.PLAYER)
  );

  const result = {
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
    tournamentsCount,
  };

  // Cache the result
  cache.set(cacheKey, result, cacheTTL.short);

  return result;
}
