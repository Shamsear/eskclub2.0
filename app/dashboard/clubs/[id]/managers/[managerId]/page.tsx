import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ManagerProfile } from "@/components/ManagerProfile";
import { getPlayer } from "@/lib/data/players";
import { RoleType } from "@prisma/client";

interface Manager {
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

export default async function ManagerProfilePage({
  params,
}: {
  params: Promise<{ id: string; managerId: string }>;
}) {
  await requireAuth();

  const { id, managerId } = await params;
  const manager: Manager | null = await getPlayer(managerId) as Manager | null;
  
  if (!manager) {
    notFound();
  }

  // Verify the manager belongs to the club in the URL
  if (manager.clubId !== parseInt(id)) {
    notFound();
  }

  return <ManagerProfile manager={manager} />;
}
