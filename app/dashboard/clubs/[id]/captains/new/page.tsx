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

export default async function NewCaptainPage({
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
  
  // TypeScript now knows club is not null after the check

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/clubs/${id}/captains`}
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
          Back to Captains
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add Captain</h1>
        <p className="text-gray-600 mt-1">
          Add a new captain to {club.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Captain Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ManagerForm 
            clubId={club.id} 
            mode="create"
            preSelectedRoles={[RoleType.CAPTAIN, RoleType.PLAYER]}
            returnPath={`/dashboard/clubs/${id}/captains`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
