import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { ManagerProfile } from "@/components/ManagerProfile";
import { getPlayer } from "@/lib/data/players";
import { RoleType } from "@prisma/client";

interface Mentor {
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

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ id: string; mentorId: string }>;
}) {
  await requireAuth();

  const { id, mentorId } = await params;
  const mentor: Mentor | null = await getPlayer(mentorId) as Mentor | null;
  
  if (!mentor) {
    notFound();
  }

  // Verify the mentor belongs to the club in the URL
  if (mentor.clubId !== parseInt(id)) {
    notFound();
  }

  // Verify the member has the MENTOR role
  const hasMentorRole = mentor.roles.some(r => r.role === RoleType.MENTOR);
  if (!hasMentorRole) {
    notFound();
  }

  return <ManagerProfile 
    manager={mentor} 
    roleContext="mentor"
    listPath={`/dashboard/clubs/${id}/mentors`}
  />;
}
