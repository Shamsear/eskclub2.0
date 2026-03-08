import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MatchResultForm } from "@/components/MatchResultForm";
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
                photo: true,
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

    // Transform participants to match the expected format
    const participants = tournament.participants.map((p) => ({
      id: p.player.id,
      name: p.player.name,
      photo: p.player.photo,
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
    // Log error but return null to trigger not found
    console.error('Error fetching tournament for match creation:', error);
    return null;
  }
}

export default async function AddMatchResultPage({
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tournaments", href: "/dashboard/tournaments" },
          { label: tournament.name, href: `/dashboard/tournaments/${id}` },
          { label: "Add Match Result" },
        ]}
      />

      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <Link
            href={`/dashboard/tournaments/${id}`}
            className="inline-flex items-center gap-2 text-white hover:text-pink-100 transition-colors mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {tournament.name}
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Add Match Result</h1>
              <p className="text-pink-100 text-sm mt-1">
                Record a {tournament.matchFormat === 'DOUBLES' ? '2v2 team' : '1v1'} match result for this tournament
              </p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Select Players</h3>
              <p className="text-xs text-gray-600 mt-1">
                Choose {tournament.matchFormat === 'DOUBLES' ? 'four participants (2 teams of 2)' : 'two participants for this 1v1 match'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Enter Scores</h3>
              <p className="text-xs text-gray-600 mt-1">Record goals scored by each player</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Auto-Calculate</h3>
              <p className="text-xs text-gray-600 mt-1">Points are calculated automatically based on results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Match Information</h2>
              <p className="text-sm text-gray-600 mt-0.5">Fill in the details below to record this match</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <MatchResultForm
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
            mode="create"
          />
        </div>
      </div>
    </div>
  );
}
