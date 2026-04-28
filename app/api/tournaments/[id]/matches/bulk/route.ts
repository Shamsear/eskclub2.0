import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePointsWithRules, updatePlayerStatistics, PointSystemConfig } from "@/lib/match-utils";
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError,
} from "@/lib/errors";

interface BulkMatchData {
  playerAName: string;
  playerBName: string;
  playerCName?: string;
  playerDName?: string;
  playerAGoals: number;
  playerBGoals: number;
  matchDate: string;
  walkover?: string;
  playerAExtraPoints?: number;
  playerBExtraPoints?: number;
  playerCExtraPoints?: number;
  playerDExtraPoints?: number;
}

// POST /api/tournaments/[id]/matches/bulk - Create multiple matches
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const tournamentId = parseInt(id);
    
    if (isNaN(tournamentId)) {
      throw new ValidationError("Invalid tournament ID");
    }

    const body = await request.json();
    const { matches } = body as { matches: BulkMatchData[] };

    if (!Array.isArray(matches) || matches.length === 0) {
      throw new ValidationError("Matches array is required and must not be empty");
    }

    // Check if tournament exists and get its configuration
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        matchFormat: true,
        pointSystemTemplateId: true,
        pointsPerWin: true,
        pointsPerDraw: true,
        pointsPerLoss: true,
        pointsPerGoalScored: true,
        pointsPerGoalConceded: true,
        pointsPerCleanSheet: true,
        pointsPerStageWin: true,
        pointsPerStageDraw: true,
        pointsForWalkoverWin: true,
        pointsForWalkoverLoss: true,
      },
    });

    if (!tournament) {
      throw new NotFoundError("Tournament");
    }

    const isDoublesFormat = tournament.matchFormat === 'DOUBLES';

    // Get all participants
    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            clubId: true,
          },
        },
      },
    });

    const playerMap = new Map(participants.map(p => [p.player.name.toLowerCase(), p.player]));

    // Fetch point system configuration
    let pointSystemConfig: PointSystemConfig;
    
    if (tournament.pointSystemTemplateId) {
      const template = await prisma.pointSystemTemplate.findUnique({
        where: { id: tournament.pointSystemTemplateId },
        include: {
          conditionalRules: true,
        },
      });

      if (template) {
        pointSystemConfig = {
          pointsPerWin: template.pointsPerWin,
          pointsPerDraw: template.pointsPerDraw,
          pointsPerLoss: template.pointsPerLoss,
          pointsPerGoalScored: template.pointsPerGoalScored,
          pointsPerGoalConceded: template.pointsPerGoalConceded,
          pointsPerCleanSheet: template.pointsPerCleanSheet,
          pointsPerStageWin: template.pointsPerStageWin,
          pointsPerStageDraw: template.pointsPerStageDraw,
          conditionalRules: template.conditionalRules,
          pointsForWalkoverWin: template.pointsForWalkoverWin,
          pointsForWalkoverLoss: template.pointsForWalkoverLoss,
        };
      } else {
        pointSystemConfig = {
          pointsPerWin: tournament.pointsPerWin,
          pointsPerDraw: tournament.pointsPerDraw,
          pointsPerLoss: tournament.pointsPerLoss,
          pointsPerGoalScored: tournament.pointsPerGoalScored,
          pointsPerGoalConceded: tournament.pointsPerGoalConceded,
          pointsPerCleanSheet: tournament.pointsPerCleanSheet,
          pointsPerStageWin: tournament.pointsPerStageWin,
          pointsPerStageDraw: tournament.pointsPerStageDraw,
          pointsForWalkoverWin: tournament.pointsForWalkoverWin,
          pointsForWalkoverLoss: tournament.pointsForWalkoverLoss,
        };
      }
    } else {
      pointSystemConfig = {
        pointsPerWin: tournament.pointsPerWin,
        pointsPerDraw: tournament.pointsPerDraw,
        pointsPerLoss: tournament.pointsPerLoss,
        pointsPerGoalScored: tournament.pointsPerGoalScored,
        pointsPerGoalConceded: tournament.pointsPerGoalConceded,
        pointsPerCleanSheet: tournament.pointsPerCleanSheet,
        pointsPerStageWin: tournament.pointsPerStageWin,
        pointsPerStageDraw: tournament.pointsPerStageDraw,
        pointsForWalkoverWin: tournament.pointsForWalkoverWin,
        pointsForWalkoverLoss: tournament.pointsForWalkoverLoss,
      };
    }

    const errors: string[] = [];
    const addedMatches: any[] = [];
    let skipped = 0;

    // Process each match
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const matchNum = i + 1;

      try {
        // Find players
        const playerA = playerMap.get(match.playerAName.toLowerCase());
        const playerB = playerMap.get(match.playerBName.toLowerCase());

        if (!playerA) {
          errors.push(`Match ${matchNum}: Player "${match.playerAName}" not found in tournament participants`);
          skipped++;
          continue;
        }
        if (!playerB) {
          errors.push(`Match ${matchNum}: Player "${match.playerBName}" not found in tournament participants`);
          skipped++;
          continue;
        }

        let playerC: { id: number; name: string; clubId: number | null } | undefined;
        let playerD: { id: number; name: string; clubId: number | null } | undefined;
        if (isDoublesFormat) {
          if (!match.playerCName || !match.playerDName) {
            errors.push(`Match ${matchNum}: Doubles format requires 4 players`);
            skipped++;
            continue;
          }

          playerC = playerMap.get(match.playerCName.toLowerCase());
          playerD = playerMap.get(match.playerDName.toLowerCase());

          if (!playerC) {
            errors.push(`Match ${matchNum}: Player "${match.playerCName}" not found in tournament participants`);
            skipped++;
            continue;
          }
          if (!playerD) {
            errors.push(`Match ${matchNum}: Player "${match.playerDName}" not found in tournament participants`);
            skipped++;
            continue;
          }

          // Validate team composition
          if (playerA.clubId !== playerB.clubId) {
            errors.push(`Match ${matchNum}: Team 1 players must be from same club or both free agents`);
            skipped++;
            continue;
          }
          if (playerC.clubId !== playerD.clubId) {
            errors.push(`Match ${matchNum}: Team 2 players must be from same club or both free agents`);
            skipped++;
            continue;
          }
        }

        // Determine outcomes and handle walkovers
        const teamAGoals = match.playerAGoals;
        const teamBGoals = match.playerBGoals;
        let teamAOutcome: 'WIN' | 'DRAW' | 'LOSS';
        let teamBOutcome: 'WIN' | 'DRAW' | 'LOSS';
        let walkoverWinnerId: number | null = null;
        let isWalkover = false;

        // Check if this is a walkover match
        if (match.walkover) {
          isWalkover = true;
          const walkoverLower = match.walkover.toLowerCase().trim();
          
          if (walkoverLower === 'both' || walkoverLower === 'none') {
            // Both forfeited
            walkoverWinnerId = 0;
            teamAOutcome = 'LOSS';
            teamBOutcome = 'LOSS';
          } else if (walkoverLower === match.playerAName.toLowerCase().trim()) {
            // Player A won by walkover
            walkoverWinnerId = playerA.id;
            teamAOutcome = 'WIN';
            teamBOutcome = 'LOSS';
          } else if (walkoverLower === match.playerBName.toLowerCase().trim()) {
            // Player B won by walkover
            walkoverWinnerId = playerB.id;
            teamAOutcome = 'LOSS';
            teamBOutcome = 'WIN';
          } else {
            errors.push(`Match ${matchNum}: Invalid walkover value "${match.walkover}". Use player name or "both"`);
            skipped++;
            continue;
          }
        } else {
          // Normal match - determine outcome by goals
          if (teamAGoals > teamBGoals) {
            teamAOutcome = 'WIN';
            teamBOutcome = 'LOSS';
          } else if (teamAGoals < teamBGoals) {
            teamAOutcome = 'LOSS';
            teamBOutcome = 'WIN';
          } else {
            teamAOutcome = 'DRAW';
            teamBOutcome = 'DRAW';
          }
        }

        // Calculate points
        const calculatePoints = (
          playerId: number,
          outcome: 'WIN' | 'DRAW' | 'LOSS', 
          goalsScored: number, 
          goalsConceded: number, 
          extraPoints: number = 0
        ) => {
          // Handle walkover points
          if (isWalkover) {
            const walkoverWinPoints = pointSystemConfig.pointsForWalkoverWin || 3;
            const walkoverLossPoints = pointSystemConfig.pointsForWalkoverLoss || -3;
            
            if (walkoverWinnerId === 0) {
              // Both forfeited - no points
              return {
                pointsEarned: 0,
                basePoints: 0,
                conditionalPoints: 0,
              };
            } else if (playerId === walkoverWinnerId) {
              // Winner by walkover
              return {
                pointsEarned: walkoverWinPoints,
                basePoints: walkoverWinPoints,
                conditionalPoints: 0,
              };
            } else {
              // Loser by walkover
              return {
                pointsEarned: walkoverLossPoints,
                basePoints: walkoverLossPoints,
                conditionalPoints: 0,
              };
            }
          }
          
          // Normal match - calculate points with rules
          const result = {
            outcome,
            goalsScored,
            goalsConceded,
          };
          const calculation = calculatePointsWithRules(result, pointSystemConfig);
          return {
            pointsEarned: calculation.totalPoints + extraPoints,
            basePoints: calculation.basePoints + extraPoints,
            conditionalPoints: calculation.conditionalPoints,
          };
        };

        const teamAPoints = calculatePoints(playerA.id, teamAOutcome, teamAGoals, teamBGoals, match.playerAExtraPoints || 0);
        const teamBPoints = calculatePoints(playerB.id, teamBOutcome, teamBGoals, teamAGoals, match.playerBExtraPoints || 0);

        // Create match in transaction
        const createdMatch = await prisma.$transaction(async (tx) => {
          const newMatch = await tx.match.create({
            data: {
              tournamentId,
              matchDate: new Date(match.matchDate),
              isTeamMatch: isDoublesFormat,
              ...(walkoverWinnerId !== null && { walkoverWinnerId }),
            },
          });

          if (isDoublesFormat && playerC && playerD) {
            // Create team match results
            if (playerA.clubId) {
              await tx.teamMatchResult.create({
                data: {
                  matchId: newMatch.id,
                  clubId: playerA.clubId,
                  teamPosition: 1,
                  playerAId: playerA.id,
                  playerBId: playerB.id,
                  outcome: teamAOutcome,
                  goalsScored: teamAGoals,
                  goalsConceded: teamBGoals,
                  pointsEarned: teamAPoints.pointsEarned,
                  basePoints: teamAPoints.basePoints,
                  conditionalPoints: teamAPoints.conditionalPoints,
                },
              });
            }

            if (playerC.clubId) {
              await tx.teamMatchResult.create({
                data: {
                  matchId: newMatch.id,
                  clubId: playerC.clubId,
                  teamPosition: 2,
                  playerAId: playerC.id,
                  playerBId: playerD.id,
                  outcome: teamBOutcome,
                  goalsScored: teamBGoals,
                  goalsConceded: teamAGoals,
                  pointsEarned: teamBPoints.pointsEarned,
                  basePoints: teamBPoints.basePoints,
                  conditionalPoints: teamBPoints.conditionalPoints,
                },
              });
            }
          } else {
            // Create individual match results for singles
            await tx.matchResult.createMany({
              data: [
                {
                  matchId: newMatch.id,
                  playerId: playerA.id,
                  outcome: teamAOutcome,
                  goalsScored: teamAGoals,
                  goalsConceded: teamBGoals,
                  pointsEarned: teamAPoints.pointsEarned,
                  basePoints: teamAPoints.basePoints,
                  conditionalPoints: teamAPoints.conditionalPoints,
                },
                {
                  matchId: newMatch.id,
                  playerId: playerB.id,
                  outcome: teamBOutcome,
                  goalsScored: teamBGoals,
                  goalsConceded: teamAGoals,
                  pointsEarned: teamBPoints.pointsEarned,
                  basePoints: teamBPoints.basePoints,
                  conditionalPoints: teamBPoints.conditionalPoints,
                },
              ],
            });
          }

          return newMatch;
        });

        addedMatches.push(createdMatch);

        // Update player statistics for singles matches
        if (!isDoublesFormat) {
          await updatePlayerStatistics(tournamentId, [playerA.id, playerB.id]);
        }
      } catch (error: any) {
        errors.push(`Match ${matchNum}: ${error.message || 'Unknown error'}`);
        skipped++;
      }
    }

    return NextResponse.json({
      added: addedMatches.length,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
