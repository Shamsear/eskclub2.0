import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BulkMatchUpload } from "@/components/BulkMatchUpload";

async function getTournamentWithParticipants(id: string) {
  const tournamentId = parseInt(id);
  
  if (isNaN(tournamentId) || tournamentId <= 0) {
    return null;
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        name: true,
        matchFormat: true,
        pointsPerWin: true,
        pointsPerDraw: true,
        pointsPerLoss: true,
        pointsPerGoalScored: true,
        pointsPerGoalConceded: true,
        pointSystemTemplateId: true,
        participants: {
          select: {
            player: {
              select: {
                id: true,
                name: true,
                clubId: true,
              },
            },
          },
        },
      },
    });

    if (!tournament) {
      return null;
    }

    const participants = tournament.participants.map((p) => ({
      id: p.player.id,
      name: p.player.name,
      clubId: p.player.clubId,
    }));

    // Fetch walkover points from template if available
    let walkoverPoints = { pointsForWalkoverWin: 3, pointsForWalkoverLoss: -3 };
    if (tournament.pointSystemTemplateId) {
      const template = await prisma.pointSystemTemplate.findUnique({
        where: { id: tournament.pointSystemTemplateId },
        select: {
          pointsForWalkoverWin: true,
          pointsForWalkoverLoss: true,
        },
      });
      if (template) {
        walkoverPoints = {
          pointsForWalkoverWin: template.pointsForWalkoverWin,
          pointsForWalkoverLoss: template.pointsForWalkoverLoss,
        };
      }
    }

    return {
      ...tournament,
      participants,
      ...walkoverPoints,
    };
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
}

export default async function BulkAddMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id } = await params;
  const tournament = await getTournamentWithParticipants(id);

  if (!tournament) {
    return notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <Link
            href={`/dashboard/tournaments/${id}`}
            className="inline-flex items-center gap-2 text-white hover:text-orange-100 transition-colors mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {tournament.name}
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Bulk Add Match Results</h1>
              <p className="text-orange-100 text-sm mt-1">Upload multiple match results at once</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">CSV Upload</h3>
              <p className="text-xs text-gray-600 mt-1">Upload a CSV file with match details for quick import</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Manual Entry</h3>
              <p className="text-xs text-gray-600 mt-1">Enter match details directly in the form below</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Auto-Calculate</h3>
              <p className="text-xs text-gray-600 mt-1">Outcomes and points calculated automatically</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bulk Upload</h2>
              <p className="text-sm text-gray-600 mt-0.5">Upload CSV or enter matches manually</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <BulkMatchUpload 
            tournamentId={tournament.id}
            matchFormat={tournament.matchFormat}
            participants={tournament.participants}
            pointSystem={{
              pointsPerWin: tournament.pointsPerWin,
              pointsPerDraw: tournament.pointsPerDraw,
              pointsPerLoss: tournament.pointsPerLoss,
              pointsPerGoalScored: tournament.pointsPerGoalScored,
              pointsPerGoalConceded: tournament.pointsPerGoalConceded,
              pointsForWalkoverWin: tournament.pointsForWalkoverWin,
              pointsForWalkoverLoss: tournament.pointsForWalkoverLoss,
            }}
          />
        </div>
      </div>
    </div>
  );
}
