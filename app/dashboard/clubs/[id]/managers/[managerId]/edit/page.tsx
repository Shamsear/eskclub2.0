import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ManagerForm } from "@/components/ManagerForm";
import { getPlayer } from "@/lib/data/players";

interface Manager {
  id: number;
  clubId: number;
  name: string;
  email: string;
  phone?: string | null;
  place?: string | null;
  dateOfBirth?: string | null;
  photo?: string | null;
  club: {
    id: number;
    name: string;
  };
}

export default async function EditManagerPage({
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

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/clubs/${id}/managers/${managerId}`}
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
          Back to Manager Profile
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Manager</h1>
        <p className="text-gray-600 mt-1">
          Update information for {manager.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manager Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ManagerForm
            clubId={manager.clubId}
            initialData={{
              id: manager.id,
              name: manager.name,
              email: manager.email,
              phone: manager.phone,
              place: manager.place,
              dateOfBirth: manager.dateOfBirth,
              photo: manager.photo,
            }}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
