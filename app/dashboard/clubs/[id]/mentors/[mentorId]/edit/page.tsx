import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ManagerForm } from "@/components/ManagerForm";
import { RoleType } from "@prisma/client";
import { getPlayer } from "@/lib/data/players";

interface Mentor {
  id: number;
  clubId: number;
  name: string;
  email: string;
  phone?: string | null;
  place?: string | null;
  dateOfBirth?: string | null;
  photo?: string | null;
  roles: Array<{ role: RoleType }>;
  club: {
    id: number;
    name: string;
  };
}

export default async function EditMentorPage({
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

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/clubs/${id}/mentors/${mentorId}`}
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
          Back to Mentor Profile
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Mentor</h1>
        <p className="text-gray-600 mt-1">
          Update information for {mentor.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mentor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ManagerForm
            clubId={mentor.clubId}
            initialData={{
              id: mentor.id,
              name: mentor.name,
              email: mentor.email,
              phone: mentor.phone,
              place: mentor.place,
              dateOfBirth: mentor.dateOfBirth,
              photo: mentor.photo,
              roles: mentor.roles,
            }}
            mode="edit"
            returnPath={`/dashboard/clubs/${id}/mentors`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
