import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FreeAgentForm from "@/components/FreeAgentForm";

export default async function EditFreeAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id } = await params;

  const freeAgent = await prisma.player.findUnique({
    where: {
      id: parseInt(id),
      clubId: null,
    },
  });

  if (!freeAgent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Free Agent</h1>
          </div>
          <p className="text-white text-opacity-90 text-sm sm:text-base">
            Update information for {freeAgent.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <FreeAgentForm
          mode="edit"
          initialData={{
            id: freeAgent.id.toString(),
            name: freeAgent.name,
            email: freeAgent.email,
            phone: freeAgent.phone || "",
            dateOfBirth: freeAgent.dateOfBirth?.toISOString().split("T")[0] || "",
            gender: freeAgent.gender,
            state: freeAgent.state,
            district: freeAgent.district,
          }}
        />
      </div>
    </div>
  );
}
