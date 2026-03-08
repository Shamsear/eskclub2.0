import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { ManagerProfile } from "@/components/ManagerProfile";
import { getPlayer } from "@/lib/data/players";
import { prisma } from "@/lib/prisma";

async function getPlayerMatchResults(playerId: number) {
  try {
    const matchResults = await prisma.matchResult.findMany({
      where: {
        playerId: playerId,
      },
      include: {
        match: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
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
            },
          },
        },
      },
      orderBy: {
        match: {
          matchDate: 'desc',
        },
      },
    });

    return matchResults;
  } catch (error) {
    console.error('Error fetching player match results:', error);
    return [];
  }
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string; playerId: string }>;
}) {
  await requireAuth();

  const { id, playerId } = await params;
  const player = await getPlayer(playerId);

  if (!player) {
    notFound();
  }

  const matchResults = await getPlayerMatchResults(parseInt(playerId));

  return (
    <ManagerProfile
      manager={player}
      roleContext="player"
      listPath={`/dashboard/clubs/${id}/players`}
      matchResults={matchResults}
    />
  );
}
