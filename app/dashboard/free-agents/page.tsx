import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { FreeAgentsClient } from "@/components/FreeAgentsClient";

export default async function FreeAgentsPage() {
  await requireAuth();

  const freeAgents = await prisma.player.findMany({
    where: {
      clubId: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <FreeAgentsClient freeAgents={freeAgents} />;
}
