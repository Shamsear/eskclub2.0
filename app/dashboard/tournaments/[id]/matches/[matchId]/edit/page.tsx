import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MatchResultForm } from "@/components/MatchResultForm";
import { Breadcrumb } from "@/components/Breadcrumb";

async function getMatchWithTournament(matchId: string, tournamentId: string) {
  const matchIdNum = parseInt(matchId);
  const tournamentIdNum = parseInt(tournamentId);
  
  // Validate ID formats
  if (isNaN(matchIdNum) || isNaN(tournamentIdNum) || matchIdNum <= 0 || tournamentIdNum <= 0) {
    return null;
  }

  try {
    // Fetch match with results
    const match = await prisma.match.findUnique({
      where: { id: matchIdNum },
      select: {
        id: true,
        matchDate: true,
        stageId: true,
        stageName: true,
        isTeamMatch: true,
        tournament: {
          select: {
            id: true,
            name: true,
            matchFormat: true,
            pointsPerWin: true,
            pointsPerDraw: true,
            pointsPerLoss: true,
            pointsPerGoalScored: true,
            pointsPerGoalConceded: true,
          },
        },
        results: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                photo: true,
              },
            },
          },
          orderBy: {
            player: {
              name: "asc",
            },
          },
        },
        teamResults: {
          include: {
            playerA: {
              select: {
                id: true,
                name: true,
                email: true,
                photo: true,
              },
            },
            playerB: {
              select: {
                id: true,
                name: true,
                email: true,
                photo: true,
              },
            },
          },
          orderBy: {
            teamPosition: "asc",
          },
        },
      },
    });

    if (!match) {
      return null;
    }

    // Verify the match belongs to the specified tournament
    if (match.tournament.id !== tournamentIdNum) {
      return null;
    }

    // Fetch tournament participants for the form
    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId: tournamentIdNum },
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
      orderBy: {
        player: {
          name: "asc",
        },
      },
    });

    return {
      match,
      participants: participants.map((p) => ({
        id: p.player.id,
        name: p.player.name,
        photo: p.player.photo,
        clubId: p.player.clubId,
      })),
    };
  } catch (error) {
    // Log error but return null to trigger not found
    console.error('Error fetching match for edit:', error);
    return null;
  }
}

export default async function EditMatchResultPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  await requireAuth();

  const { id, matchId } = await params;
  const data = await getMatchWithTournament(matchId, id);

  if (!data) {
    return notFound();
  }

  const { match, participants } = data;

  // Format match data for the form
  // For doubles matches, convert teamResults to results format
  let formattedResults;
  if (match.isTeamMatch && match.teamResults.length > 0) {
    // Convert team results to individual player results for the form
    formattedResults = match.teamResults.flatMap((teamResult) => [
      {
        playerId: teamResult.playerA.id,
        outcome: teamResult.outcome,
        goalsScored: teamResult.goalsScored,
        goalsConceded: teamResult.goalsConceded,
        pointsEarned: teamResult.pointsEarned,
        player: teamResult.playerA,
      },
      {
        playerId: teamResult.playerB.id,
        outcome: teamResult.outcome,
        goalsScored: teamResult.goalsScored,
        goalsConceded: teamResult.goalsConceded,
        pointsEarned: teamResult.pointsEarned,
        player: teamResult.playerB,
      },
    ]);
  } else {
    formattedResults = match.results.map((result) => ({
      id: result.id,
      playerId: result.playerId,
      outcome: result.outcome,
      goalsScored: result.goalsScored,
      goalsConceded: result.goalsConceded,
      pointsEarned: result.pointsEarned,
      player: result.player,
    }));
  }

  const initialData = {
    id: match.id,
    matchDate: match.matchDate.toISOString().split("T")[0],
    stageId: match.stageId,
    stageName: match.stageName,
    results: formattedResults,
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tournaments", href: "/dashboard/tournaments" },
          { label: match.tournament.name, href: `/dashboard/tournaments/${id}` },
          { label: "Edit Match Result" },
        ]}
      />

      <div className="mb-6">
        <Link
          href={`/dashboard/tournaments/${id}`}
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
          Back to Tournament
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Match Result</h1>
        <p className="text-gray-600 mt-1">
          Update match results for {match.tournament.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match Information</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchResultForm
            tournamentId={match.tournament.id}
            matchId={match.id}
            matchFormat={match.tournament.matchFormat}
            participants={participants}
            initialData={initialData}
            pointSystem={{
              pointsPerWin: match.tournament.pointsPerWin,
              pointsPerDraw: match.tournament.pointsPerDraw,
              pointsPerLoss: match.tournament.pointsPerLoss,
              pointsPerGoalScored: match.tournament.pointsPerGoalScored,
              pointsPerGoalConceded: match.tournament.pointsPerGoalConceded,
            }}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
