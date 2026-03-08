import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { cache, cacheKeys, cacheTTL } from "@/lib/cache";

export async function getPlayer(id: string): Promise<any> {
  const playerId = parseInt(id);
  
  if (isNaN(playerId)) {
    return null;
  }

  // Check cache first
  const cacheKey = cacheKeys.player(playerId);
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached as any;
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      roles: true,
      club: true,
    },
  });

  // Cache the result
  if (player) {
    cache.set(cacheKey, player, cacheTTL.medium);
  }

  return player;
}

export async function getPlayersByClub(
  clubId: string,
  options?: {
    page?: number;
    pageSize?: number;
    role?: RoleType;
  }
): Promise<{
  players: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const id = parseInt(clubId);
  
  if (isNaN(id)) {
    return { players: [], total: 0, page: 1, pageSize: 50, totalPages: 0 };
  }

  const page = options?.page || 1;
  const pageSize = options?.pageSize || 50;
  const skip = (page - 1) * pageSize;

  // Check cache first (only cache first page for simplicity)
  const cacheKey = cacheKeys.playersByClub(id, options?.role);
  if (page === 1) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached as any;
    }
  }

  const whereClause: any = {
    clubId: id,
    roles: {
      some: {
        role: options?.role || RoleType.PLAYER,
      },
    },
  };

  const [players, total] = await Promise.all([
    prisma.player.findMany({
      where: whereClause,
      include: {
        roles: true,
      },
      orderBy: { createdAt: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.player.count({ where: whereClause }),
  ]);

  const result = {
    players,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };

  // Cache the result (only first page)
  if (page === 1) {
    cache.set(cacheKey, result, cacheTTL.short);
  }

  return result;
}

export async function getPlayersCountByClub(clubId: string) {
  const id = parseInt(clubId);
  
  if (isNaN(id)) {
    return 0;
  }

  return await prisma.player.count({
    where: {
      clubId: id,
      roles: {
        some: {
          role: RoleType.PLAYER,
        },
      },
    },
  });
}

export async function getManagersByClub(
  clubId: string,
  options?: { page?: number; pageSize?: number }
) {
  return getPlayersByClub(clubId, {
    ...options,
    role: RoleType.MANAGER,
  });
}

export async function getMentorsByClub(
  clubId: string,
  options?: { page?: number; pageSize?: number }
) {
  return getPlayersByClub(clubId, {
    ...options,
    role: RoleType.MENTOR,
  });
}

export async function getCaptainsByClub(
  clubId: string,
  options?: { page?: number; pageSize?: number }
) {
  return getPlayersByClub(clubId, {
    ...options,
    role: RoleType.CAPTAIN,
  });
}
