import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id } = await params;

  const player = await prisma.player.findUnique({
    where: { id: parseInt(id) },
    include: {
      club: true,
      clubStats: {
        include: {
          club: true,
        },
        orderBy: {
          joinedAt: "desc",
        },
      },
      transferHistory: {
        include: {
          fromClub: true,
          toClub: true,
        },
        orderBy: {
          transferDate: "desc",
        },
      },
    },
  });

  if (!player) {
    notFound();
  }

  // Calculate total career stats
  const careerStats = player.clubStats.reduce(
    (acc, stat) => ({
      matchesPlayed: acc.matchesPlayed + stat.matchesPlayed,
      wins: acc.wins + stat.wins,
      draws: acc.draws + stat.draws,
      losses: acc.losses + stat.losses,
      goalsScored: acc.goalsScored + stat.goalsScored,
      goalsConceded: acc.goalsConceded + stat.goalsConceded,
      totalPoints: acc.totalPoints + stat.totalPoints,
    }),
    {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsScored: 0,
      goalsConceded: 0,
      totalPoints: 0,
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm text-3xl font-bold">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{player.name}</h1>
              <p className="text-white text-opacity-90 text-sm sm:text-base">
                {player.club ? player.club.name : "Free Agent"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-white text-opacity-70">Email</p>
              <p className="font-medium">{player.email}</p>
            </div>
            <div>
              <p className="text-white text-opacity-70">Phone</p>
              <p className="font-medium">{player.phone || "-"}</p>
            </div>
            <div>
              <p className="text-white text-opacity-70">Location</p>
              <p className="font-medium">{player.district}, {player.state}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Career Stats Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Career Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{careerStats.matchesPlayed}</p>
            <p className="text-sm text-gray-600">Matches</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{careerStats.wins}</p>
            <p className="text-sm text-gray-600">Wins</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{careerStats.draws}</p>
            <p className="text-sm text-gray-600">Draws</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{careerStats.losses}</p>
            <p className="text-sm text-gray-600">Losses</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{careerStats.goalsScored}</p>
            <p className="text-sm text-gray-600">Goals</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{careerStats.goalsConceded}</p>
            <p className="text-sm text-gray-600">Conceded</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{careerStats.totalPoints}</p>
            <p className="text-sm text-gray-600">Points</p>
          </div>
        </div>
      </div>

      {/* Club-wise Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Club-wise Performance</h2>
          <p className="text-sm text-gray-600 mt-1">
            Stats tracked separately for each club period
          </p>
        </div>
        
        {player.clubStats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No stats recorded yet
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {player.clubStats.map((stat) => (
              <div key={stat.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {stat.club ? stat.club.name.charAt(0).toUpperCase() : "FA"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {stat.club ? stat.club.name : "Free Agent"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(stat.joinedAt).toLocaleDateString()} - {stat.leftAt ? new Date(stat.leftAt).toLocaleDateString() : "Present"}
                      </p>
                    </div>
                  </div>
                  {!stat.leftAt && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Current
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.matchesPlayed}</p>
                    <p className="text-xs text-gray-600">Matches</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stat.wins}</p>
                    <p className="text-xs text-gray-600">Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stat.draws}</p>
                    <p className="text-xs text-gray-600">Draws</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stat.losses}</p>
                    <p className="text-xs text-gray-600">Losses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stat.goalsScored}</p>
                    <p className="text-xs text-gray-600">Goals</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{stat.goalsConceded}</p>
                    <p className="text-xs text-gray-600">Conceded</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stat.totalPoints}</p>
                    <p className="text-xs text-gray-600">Points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transfer History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Transfer History</h2>
        </div>
        
        {player.transferHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transfers recorded
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {player.transferHistory.map((transfer) => (
              <div key={transfer.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 min-w-[100px]">
                    {new Date(transfer.transferDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      {transfer.fromClub ? transfer.fromClub.name : "Free Agent"}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      {transfer.toClub ? transfer.toClub.name : "Free Agent"}
                    </span>
                  </div>
                </div>
                {transfer.notes && (
                  <p className="mt-2 text-sm text-gray-600 ml-[116px]">{transfer.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/dashboard/transfers/new?playerId=${player.id}`}>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Transfer Player
          </button>
        </Link>
        <Link href="/dashboard/players">
          <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Back to Players
          </button>
        </Link>
      </div>
    </div>
  );
}
