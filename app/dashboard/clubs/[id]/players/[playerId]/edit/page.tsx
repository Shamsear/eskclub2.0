import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ManagerForm } from "@/components/ManagerForm";
import { RoleType } from "@prisma/client";
import { getPlayer } from "@/lib/data/players";

interface Player {
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
  roles: Array<{
    id: number;
    role: RoleType;
  }>;
}

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string; playerId: string }>;
}) {
  await requireAuth();

  const { id, playerId } = await params;
  const player: Player | null = await getPlayer(playerId) as Player | null;

  if (!player) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <Link
            href={`/dashboard/clubs/${id}/players/${playerId}`}
            className="inline-flex items-center gap-2 text-white hover:text-purple-100 transition-colors mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {player.name}&apos;s Profile
          </Link>
          
          <div className="flex items-center gap-3">
            {player.photo ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center p-1 flex-shrink-0">
                <img
                  src={player.photo}
                  alt={`${player.name} photo`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Edit Member</h1>
              <p className="text-purple-100 text-sm mt-1">Update information for {player.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Editing Member Information</h3>
            <p className="text-sm text-gray-600">Changes will be reflected immediately across all tournaments and records associated with this member.</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Member Information</h2>
              <p className="text-sm text-gray-600 mt-0.5">Update the details below to modify this member</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <ManagerForm
            clubId={parseInt(id)}
            mode="edit"
            initialData={player}
            returnPath={`/dashboard/clubs/${id}/players/${playerId}`}
          />
        </div>
      </div>
    </div>
  );
}
