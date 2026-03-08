import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ManagerForm } from "@/components/ManagerForm";
import { RoleType } from "@prisma/client";
import { getClubBasic } from "@/lib/data/clubs";

interface Club {
  id: number;
  name: string;
}

export default async function NewMentorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id } = await params;
  const club = await getClubBasic(id);
  
  if (!club) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/clubs/${id}/mentors`}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Mentors
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add Mentor</h1>
        <p className="text-gray-600 mt-1">
          Add a new mentor to {club.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mentor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ManagerForm 
            clubId={club.id} 
            mode="create"
            preSelectedRoles={[RoleType.MENTOR, RoleType.PLAYER]}
            returnPath={`/dashboard/clubs/${club.id}/mentors`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
