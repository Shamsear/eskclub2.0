import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ParticipantsList } from "@/components/ParticipantsList";
import { Breadcrumb } from "@/components/Breadcrumb";

async function getTournamentWithParticipants(id: string) {
  const tournamentId = parseInt(id);
  
  // Validate ID format
  if (isNaN(tournamentId) || tournamentId <= 0) {
    return null;
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                photo: true,
                club: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            player: {
              name: "asc",
            },
          },
        },
        _count: {
          select: {
            matches: true,
          },
        },
      },
    });

    return tournament;
  } catch (error) {
    // Log error but return null to trigger not found
    console.error('Error fetching tournament with participants:', error);
    return null;
  }
}

async function getAllPlayers() {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return players;
  } catch (error) {
    // Log error and return empty array
    console.error('Error fetching all players:', error);
    return [];
  }
}

export default async function ManageParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return notFound();
  }

  const { id } = await params;
  const [tournament, allPlayers] = await Promise.all([
    getTournamentWithParticipants(id),
    getAllPlayers(),
  ]);

  if (!tournament) {
    return notFound();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tournaments", href: "/dashboard/tournaments" },
          { label: tournament.name, href: `/dashboard/tournaments/${tournament.id}` },
          { label: "Participants" },
        ]}
      />

      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <Link
            href={`/dashboard/tournaments/${tournament.id}`}
            className="inline-flex items-center gap-2 text-white hover:text-emerald-100 transition-colors mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {tournament.name}
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Manage Participants</h1>
                <p className="text-emerald-100 text-sm mt-1">Add or remove players from this tournament</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                {tournament.participants.length} Participants
              </div>
              {tournament._count.matches > 0 && (
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                  {tournament._count.matches} Matches
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {tournament._count.matches > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Tournament Has Started</h3>
              <p className="text-sm text-gray-600">This tournament has {tournament._count.matches} match{tournament._count.matches !== 1 ? 'es' : ''} recorded. Removing participants may affect existing match results and statistics.</p>
            </div>
          </div>
        </div>
      )}

      {/* Participants List */}
      <ParticipantsList
        tournamentId={tournament.id}
        participants={tournament.participants}
        allPlayers={allPlayers}
      />
    </div>
  );
}
