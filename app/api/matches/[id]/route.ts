import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchUpdateSchema } from "@/lib/validations/match";
import { calculatePointsWithRules, updatePlayerStatistics, PointSystemConfig } from "@/lib/match-utils";
import {
  createErrorResponse,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";

// GET /api/matches/[id] - Get a single match by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      throw new ValidationError("Invalid match ID");
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        tournamentId: true,
        stageId: true,
        stageName: true,
        matchDate: true,
        isTeamMatch: true,
        walkoverWinnerId: true,
        createdAt: true,
        updatedAt: true,
        tournament: {
          select: {
            id: true,
            name: true,
            clubId: true,
            matchFormat: true,
            pointSystemTemplateId: true,
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
            club: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
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
      throw new NotFoundError("Match");
    }

    return NextResponse.json(match);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PUT /api/matches/[id] - Update a match and its results
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      throw new ValidationError("Invalid match ID");
    }

    const body = await request.json();

    // Validate request body
    const validationResult = matchUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { matchDate, stageId, stageName, walkoverWinnerId, results } = validationResult.data;

    // Check if match exists and get tournament info with point system template
    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
            matchFormat: true,
            pointSystemTemplateId: true,
            pointsPerWin: true,
            pointsPerDraw: true,
            pointsPerLoss: true,
            pointsPerGoalScored: true,
            pointsPerGoalConceded: true,
          },
        },
        results: {
          select: {
            playerId: true,
          },
        },
      },
    });

    if (!existingMatch) {
      throw new NotFoundError("Match");
    }

    const tournamentId = existingMatch.tournament.id;
    const isTeamMatch = existingMatch.tournament.matchFormat === 'DOUBLES';
    const oldPlayerIds = existingMatch.results.map(r => r.playerId);

    // If results are being updated, verify all players are participants
    let newPlayerIds: number[] = [];
    let resultsWithPoints: any[] = [];

    if (results) {
      newPlayerIds = results.map(r => r.playerId);

      const participants = await prisma.tournamentParticipant.findMany({
        where: {
          tournamentId,
          playerId: { in: newPlayerIds },
        },
        include: {
          player: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (participants.length !== newPlayerIds.length) {
        const participantIds = participants.map(p => p.playerId);
        const nonParticipantIds = newPlayerIds.filter(id => !participantIds.includes(id));

        // Get player names for better error message
        const nonParticipantPlayers = await prisma.player.findMany({
          where: { id: { in: nonParticipantIds } },
          select: { id: true, name: true },
        });

        const playerNames = nonParticipantPlayers.map(p => p.name).join(", ");
        throw new ValidationError(
          `Player(s) ${playerNames} are not participants in this tournament`
        );
      }

      // Fetch point system configuration (stage-specific, template, or inline)
      let pointSystemConfig: PointSystemConfig;
      
      // Determine which stage to use (updated stageId or existing one)
      const effectiveStageId = stageId !== undefined ? stageId : existingMatch.stageId;
      
      // If a stage is selected, try to use stage-specific points
      if (effectiveStageId && existingMatch.tournament.pointSystemTemplateId) {
        const stagePoint = await prisma.stagePoint.findFirst({
          where: {
            id: effectiveStageId,
            pointSystemTemplateId: existingMatch.tournament.pointSystemTemplateId,
          },
        });

        if (stagePoint) {
          // Use stage-specific points
          pointSystemConfig = {
            pointsPerWin: stagePoint.pointsPerWin,
            pointsPerDraw: stagePoint.pointsPerDraw,
            pointsPerLoss: stagePoint.pointsPerLoss,
            pointsPerGoalScored: stagePoint.pointsPerGoalScored,
            pointsPerGoalConceded: stagePoint.pointsPerGoalConceded,
          };
        } else {
          // Stage not found, fall back to template defaults
          const template = await prisma.pointSystemTemplate.findUnique({
            where: { id: existingMatch.tournament.pointSystemTemplateId },
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
              conditionalRules: template.conditionalRules,
            };
          } else {
            // Fallback to inline configuration if template not found
            pointSystemConfig = {
              pointsPerWin: existingMatch.tournament.pointsPerWin,
              pointsPerDraw: existingMatch.tournament.pointsPerDraw,
              pointsPerLoss: existingMatch.tournament.pointsPerLoss,
              pointsPerGoalScored: existingMatch.tournament.pointsPerGoalScored,
              pointsPerGoalConceded: existingMatch.tournament.pointsPerGoalConceded,
            };
          }
        }
      } else if (existingMatch.tournament.pointSystemTemplateId) {
        // Use point system template with conditional rules
        const template = await prisma.pointSystemTemplate.findUnique({
          where: { id: existingMatch.tournament.pointSystemTemplateId },
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
            conditionalRules: template.conditionalRules,
          };
        } else {
          // Fallback to inline configuration if template not found
          pointSystemConfig = {
            pointsPerWin: existingMatch.tournament.pointsPerWin,
            pointsPerDraw: existingMatch.tournament.pointsPerDraw,
            pointsPerLoss: existingMatch.tournament.pointsPerLoss,
            pointsPerGoalScored: existingMatch.tournament.pointsPerGoalScored,
            pointsPerGoalConceded: existingMatch.tournament.pointsPerGoalConceded,
          };
        }
      } else {
        // Use inline configuration (backward compatibility)
        pointSystemConfig = {
          pointsPerWin: existingMatch.tournament.pointsPerWin,
          pointsPerDraw: existingMatch.tournament.pointsPerDraw,
          pointsPerLoss: existingMatch.tournament.pointsPerLoss,
          pointsPerGoalScored: existingMatch.tournament.pointsPerGoalScored,
          pointsPerGoalConceded: existingMatch.tournament.pointsPerGoalConceded,
        };
      }

      // Calculate points for each result with detailed breakdown
      resultsWithPoints = results.map(result => {
        const calculation = calculatePointsWithRules(result, pointSystemConfig);
        return {
          ...result,
          pointsEarned: calculation.totalPoints,
          basePoints: calculation.basePoints,
          conditionalPoints: calculation.conditionalPoints,
        };
      });
    }

    // Update match in a transaction
    const updatedMatch = await prisma.$transaction(async (tx) => {
      // Update match date if provided
      const match = await tx.match.update({
        where: { id: matchId },
        data: {
          ...(matchDate && { matchDate: new Date(matchDate) }),
          ...(stageId !== undefined && { stageId }),
          ...(stageName !== undefined && { stageName }),
          ...(walkoverWinnerId !== undefined && { walkoverWinnerId }),
        },
      });

      // If results are being updated, delete old results and create new ones
      if (results) {
        if (isTeamMatch) {
          // Delete existing team results
          await tx.teamMatchResult.deleteMany({
            where: { matchId },
          });

          // Validate we have exactly 4 results
          if (resultsWithPoints.length !== 4) {
            throw new ValidationError(
              `Doubles matches require exactly 4 players. Received ${resultsWithPoints.length}.`
            );
          }

          // Get player details to determine clubs
          const players = await tx.player.findMany({
            where: { id: { in: newPlayerIds } },
            select: { id: true, clubId: true, name: true },
          });
          
          const playerMap = new Map(players.map(p => [p.id, p]));
          
          // Team A: players 0 and 1
          const teamAPlayer1 = resultsWithPoints[0];
          const teamAPlayer2 = resultsWithPoints[1];
          const teamAPlayer1Data = playerMap.get(teamAPlayer1.playerId);
          const teamAPlayer2Data = playerMap.get(teamAPlayer2.playerId);
          
          // Team B: players 2 and 3
          const teamBPlayer1 = resultsWithPoints[2];
          const teamBPlayer2 = resultsWithPoints[3];
          const teamBPlayer1Data = playerMap.get(teamBPlayer1.playerId);
          const teamBPlayer2Data = playerMap.get(teamBPlayer2.playerId);
          
          // Validate Team A: both players must be from same club OR both must be free agents
          const teamAClubId1 = teamAPlayer1Data?.clubId;
          const teamAClubId2 = teamAPlayer2Data?.clubId;
          
          if (teamAClubId1 !== teamAClubId2) {
            // One has club, other doesn't - or they have different clubs
            if (!teamAClubId1 || !teamAClubId2) {
              throw new ValidationError(
                `Team A: Both players must be from the same club or both must be free agents. ${teamAPlayer1Data?.name} and ${teamAPlayer2Data?.name} have different club assignments.`
              );
            } else {
              throw new ValidationError(
                `Team A: Both players must be from the same club. ${teamAPlayer1Data?.name} and ${teamAPlayer2Data?.name} are from different clubs.`
              );
            }
          }
          
          // Validate Team B: both players must be from same club OR both must be free agents
          const teamBClubId1 = teamBPlayer1Data?.clubId;
          const teamBClubId2 = teamBPlayer2Data?.clubId;
          
          if (teamBClubId1 !== teamBClubId2) {
            // One has club, other doesn't - or they have different clubs
            if (!teamBClubId1 || !teamBClubId2) {
              throw new ValidationError(
                `Team B: Both players must be from the same club or both must be free agents. ${teamBPlayer1Data?.name} and ${teamBPlayer2Data?.name} have different club assignments.`
              );
            } else {
              throw new ValidationError(
                `Team B: Both players must be from the same club. ${teamBPlayer1Data?.name} and ${teamBPlayer2Data?.name} are from different clubs.`
              );
            }
          }
          
          // Use the club ID (or null for free agents)
          const teamAClubId = teamAClubId1; // Both are same at this point
          const teamBClubId = teamBClubId1; // Both are same at this point
          
          // Create Team A result (only if they have a club - free agents don't get team results)
          if (teamAClubId) {
            await tx.teamMatchResult.create({
              data: {
                matchId,
                clubId: teamAClubId,
                teamPosition: 1,
                playerAId: teamAPlayer1.playerId,
                playerBId: teamAPlayer2.playerId,
                outcome: teamAPlayer1.outcome,
                goalsScored: teamAPlayer1.goalsScored,
                goalsConceded: teamAPlayer1.goalsConceded,
                pointsEarned: teamAPlayer1.pointsEarned,
                basePoints: teamAPlayer1.basePoints,
                conditionalPoints: teamAPlayer1.conditionalPoints,
              },
            });
          }
          
          // Create Team B result (only if they have a club - free agents don't get team results)
          if (teamBClubId) {
            await tx.teamMatchResult.create({
              data: {
                matchId,
                clubId: teamBClubId,
                teamPosition: 2,
                playerAId: teamBPlayer1.playerId,
                playerBId: teamBPlayer2.playerId,
                outcome: teamBPlayer1.outcome,
                goalsScored: teamBPlayer1.goalsScored,
                goalsConceded: teamBPlayer1.goalsConceded,
                pointsEarned: teamBPlayer1.pointsEarned,
                basePoints: teamBPlayer1.basePoints,
                conditionalPoints: teamBPlayer1.conditionalPoints,
              },
            });
          }
        } else {
          // Delete existing results
          await tx.matchResult.deleteMany({
            where: { matchId },
          });

          // Create new results
          await tx.matchResult.createMany({
            data: resultsWithPoints.map(result => ({
              matchId,
              playerId: result.playerId,
              outcome: result.outcome,
              goalsScored: result.goalsScored,
              goalsConceded: result.goalsConceded,
              pointsEarned: result.pointsEarned,
              basePoints: result.basePoints,
              conditionalPoints: result.conditionalPoints,
            })),
          });
        }
      }

      // Fetch the complete updated match
      return await tx.match.findUnique({
        where: { id: matchId },
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
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
          },
          teamResults: {
            include: {
              club: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
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
          },
        },
      });
    });

    // Update statistics for all affected players (only for singles matches)
    const affectedPlayerIds = [...new Set([...oldPlayerIds, ...newPlayerIds])];
    if (affectedPlayerIds.length > 0 && !isTeamMatch) {
      await updatePlayerStatistics(tournamentId, affectedPlayerIds);
    }

    return NextResponse.json(updatedMatch);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// DELETE /api/matches/[id] - Delete a match
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      throw new ValidationError("Invalid match ID");
    }

    // Check if match exists and get player IDs for statistics update
    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
            matchFormat: true,
          },
        },
        results: {
          select: {
            playerId: true,
          },
        },
        teamResults: {
          select: {
            playerAId: true,
            playerBId: true,
          },
        },
      },
    });

    if (!existingMatch) {
      throw new NotFoundError("Match");
    }

    const tournamentId = existingMatch.tournament.id;
    const isTeamMatch = existingMatch.tournament.matchFormat === 'DOUBLES';
    const playerIds = isTeamMatch 
      ? existingMatch.teamResults.flatMap(tr => [tr.playerAId, tr.playerBId])
      : existingMatch.results.map(r => r.playerId);
    const resultCount = isTeamMatch ? existingMatch.teamResults.length : existingMatch.results.length;

    // Delete the match (cascade will delete results)
    await prisma.match.delete({
      where: { id: matchId },
    });

    // Update statistics for affected players (only for singles matches)
    if (playerIds.length > 0 && !isTeamMatch) {
      await updatePlayerStatistics(tournamentId, playerIds);
    }

    return NextResponse.json(
      {
        message: "Match deleted successfully",
        deletedResults: resultCount,
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
