import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { ManagerProfile } from "@/components/ManagerProfile";
import { getPlayer } from "@/lib/data/players";
import { RoleType } from "@prisma/client";

interface Captain {
  id: number;
  clubId: number;
  name: string;
  email: string;
  phone?: string | null;
  place?: string | null;
  dateOfBirth?: string | null;
  photo?: string | null;
  createdAt: string;
  updatedAt: string;
  roles: Array<{ role: RoleType }>;
  club: {
    id: number;
    name: string;
  };
}

export default async function CaptainProfilePage({
  params,
}: {
  params: Promise<{ id: string; captainId: string }>;
}) {
  await requireAuth();

  const { id, captainId } = await params;
  const captain: Captain | null = await getPlayer(captainId) as Captain | null;
  
  if (!captain) {
    notFound();
  }

  // Verify the captain belongs to the club in the URL
  if (captain.clubId !== parseInt(id)) {
    notFound();
  }

  // Verify the member has the CAPTAIN role
  const hasCaptainRole = captain.roles.some(r => r.role === RoleType.CAPTAIN);
  if (!hasCaptainRole) {
    notFound();
  }

  return <ManagerProfile 
    manager={captain} 
    roleContext="captain"
    listPath={`/dashboard/clubs/${id}/captains`}
  />;
}
