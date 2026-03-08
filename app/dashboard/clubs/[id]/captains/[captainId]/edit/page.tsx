import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ManagerForm } from "@/components/ManagerForm";
import { RoleType } from "@prisma/client";
import { getPlayer } from "@/lib/data/players";

interface Captain {
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

export default async function EditCaptainPage({
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

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/clubs/${id}/captains/${captainId}`}
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
          Back to Captain Profile
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Captain</h1>
        <p className="text-gray-600 mt-1">
          Update information for {captain.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Captain Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ManagerForm
            clubId={captain.clubId}
            initialData={{
              id: captain.id,
              name: captain.name,
              email: captain.email,
              phone: captain.phone,
              place: captain.place,
              dateOfBirth: captain.dateOfBirth,
              photo: captain.photo,
              roles: captain.roles,
            }}
            mode="edit"
            returnPath={`/dashboard/clubs/${id}/captains`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
