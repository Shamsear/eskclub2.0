import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import TransferForm from "@/components/TransferForm";

export default async function NewTransferPage() {
  await requireAuth();

  // Get all players and clubs for the form
  const [players, clubs] = await Promise.all([
    prisma.player.findMany({
      include: {
        club: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.club.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">New Transfer</h1>
          </div>
          <p className="text-white text-opacity-90 text-sm sm:text-base">
            Transfer a player between clubs or to/from free agent status
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <TransferForm players={players} clubs={clubs} />
      </div>
    </div>
  );
}
