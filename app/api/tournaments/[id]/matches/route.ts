import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchCreateSchema } from "@/lib/validations/match";
import { calculatePointsWithRules, updatePlayerStatistics, PointSystemConfig } from "@/lib/match-utils";
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError,
} from "@/lib/errors";

// GET /api/tournaments/[id]/matches - Get all matches for a tournament
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
    const tournamentId = parseInt(id);
    
    if (isNaN(tournamentId)) {
      throw new ValidationError("Invalid tournament ID");
    }

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true },
    });

    if (!tournament) {
      throw new NotFoundError("Tournament");
    }

    // Get all matches for the tournament
    const matches = await prisma.match.findMany({
      where: { tournamentId },
      include: {
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
      },
      orderBy: {
        matchDate: "desc",
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/tournaments/[id]/matches - Create a new match with results
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
    
    // Validate request body
    const validationResult = matchCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { matchDate, stageId, stageName, walkoverWinnerId, results } = validationResult.data;

    // Check if tournament exists and get its point system
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
      },
    });

    if (!tournament) {
      throw new NotFoundError("Tournament");
    }

    // Determine if this is a team match based on tournament format
    const isTeamMatch = tournament.matchFormat === 'DOUBLES';

    // Validate player count matches tournament format
    if (isTeamMatch && results.length !== 4) {
      throw new ValidationError(
        `Doubles matches require exactly 4 players (2 teams of 2). Received ${results.length} player(s).`
      );
    }
    if (!isTeamMatch && results.length !== 2) {
      throw new ValidationError(
        `Singles matches require exactly 2 players. Received ${results.length} player(s).`
      );
    }

    // Fetch point system configuration (stage-specific, template, or inline)
    let pointSystemConfig: PointSystemConfig;
    
    // If a stage is selected, try to use stage-specific points
    if (stageId && tournament.pointSystemTemplateId) {
      const stagePoint = await prisma.stagePoint.findFirst({
        where: {
          id: stageId,
          pointSystemTemplateId: tournament.pointSystemTemplateId,
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
            conditionalRules: template.conditionalRules,
          };
        } else {
          // Fallback to inline configuration if template not found
          pointSystemConfig = {
            pointsPerWin: tournament.pointsPerWin,
            pointsPerDraw: tournament.pointsPerDraw,
            pointsPerLoss: tournament.pointsPerLoss,
            pointsPerGoalScored: tournament.pointsPerGoalScored,
            pointsPerGoalConceded: tournament.pointsPerGoalConceded,
          };
        }
      }
    } else if (tournament.pointSystemTemplateId) {
      // Use point system template with conditional rules
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
          conditionalRules: template.conditionalRules,
        };
      } else {
        // Fallback to inline configuration if template not found
        pointSystemConfig = {
          pointsPerWin: tournament.pointsPerWin,
          pointsPerDraw: tournament.pointsPerDraw,
          pointsPerLoss: tournament.pointsPerLoss,
          pointsPerGoalScored: tournament.pointsPerGoalScored,
          pointsPerGoalConceded: tournament.pointsPerGoalConceded,
        };
      }
    } else {
      // Use inline configuration (backward compatibility)
      pointSystemConfig = {
        pointsPerWin: tournament.pointsPerWin,
        pointsPerDraw: tournament.pointsPerDraw,
        pointsPerLoss: tournament.pointsPerLoss,
        pointsPerGoalScored: tournament.pointsPerGoalScored,
        pointsPerGoalConceded: tournament.pointsPerGoalConceded,
      };
    }

    // Verify all players are participants in the tournament
    const playerIds = results.map(r => r.playerId);
    const participants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        playerId: { in: playerIds },
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

    if (participants.length !== playerIds.length) {
      const participantIds = participants.map(p => p.playerId);
      const nonParticipantIds = playerIds.filter(id => !participantIds.includes(id));
      
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

    // Calculate points for each result with detailed breakdown
    const resultsWithPoints = results.map(result => {
      // If custom points are provided, use them directly
      if (result.customPoints !== undefined) {
        return {
          ...result,
          pointsEarned: result.customPoints,
          basePoints: result.customPoints,
          conditionalPoints: 0,
        };
      }
      
      // Otherwise calculate normally
      const calculation = calculatePointsWithRules(result, pointSystemConfig);
      return {
        ...result,
        pointsEarned: calculation.totalPoints,
        basePoints: calculation.basePoints,
        conditionalPoints: calculation.conditionalPoints,
      };
    });

    // Handle walkover point calculations if applicable
    let finalResultsWithPoints = resultsWithPoints;
    if (walkoverWinnerId !== undefined && walkoverWinnerId !== null) {
      // Get walkover points from template or tournament
      let walkoverWinPoints = 3;
      let walkoverLossPoints = -3;
      
      if (tournament.pointSystemTemplateId) {
        const template = await prisma.pointSystemTemplate.findUnique({
          where: { id: tournament.pointSystemTemplateId },
          select: {
            pointsForWalkoverWin: true,
            pointsForWalkoverLoss: true,
          },
        });
        if (template) {
          walkoverWinPoints = template.pointsForWalkoverWin;
          walkoverLossPoints = template.pointsForWalkoverLoss;
        }
      }
      
      // Apply walkover points (unless custom points are specified)
      finalResultsWithPoints = results.map(result => {
        // If custom points are provided, use them even for walkovers
        if (result.customPoints !== undefined) {
          return {
            ...result,
            pointsEarned: result.customPoints,
            basePoints: result.customPoints,
            conditionalPoints: 0,
          };
        }
        
        if (walkoverWinnerId === 0) {
          // Both forfeited - no points
          return {
            ...result,
            pointsEarned: 0,
            basePoints: 0,
            conditionalPoints: 0,
          };
        } else if (result.playerId === walkoverWinnerId) {
          // Winner by walkover
          return {
            ...result,
            pointsEarned: walkoverWinPoints,
            basePoints: walkoverWinPoints,
            conditionalPoints: 0,
          };
        } else {
          // Loser by walkover
          return {
            ...result,
            pointsEarned: walkoverLossPoints,
            basePoints: walkoverLossPoints,
            conditionalPoints: 0,
          };
        }
      });
    }

    // Create match with results in a transaction
    const match = await prisma.$transaction(async (tx) => {
      // Create the match
      const newMatch = await tx.match.create({
        data: {
          tournamentId,
          matchDate: new Date(matchDate),
          isTeamMatch,
          ...(stageId && { stageId }),
          ...(stageName && { stageName }),
          ...(walkoverWinnerId !== undefined && { walkoverWinnerId }),
        },
      });

      if (isTeamMatch) {
        // For doubles matches, create team match results
        // Group players into teams based on the form structure:
        // Players 0,1 = Team A, Players 2,3 = Team B
        
        // Validate we have exactly 4 results
        if (finalResultsWithPoints.length !== 4) {
          throw new ValidationError(
            `Doubles matches require exactly 4 players. Received ${finalResultsWithPoints.length}.`
          );
        }
        
        // Get player details to determine clubs
        const players = await tx.player.findMany({
          where: { id: { in: playerIds } },
          select: { id: true, clubId: true, name: true },
        });
        
        const playerMap = new Map(players.map(p => [p.id, p]));
        
        // Team A: players 0 and 1
        const teamAPlayer1 = finalResultsWithPoints[0];
        const teamAPlayer2 = finalResultsWithPoints[1];
        const teamAPlayer1Data = playerMap.get(teamAPlayer1.playerId);
        const teamAPlayer2Data = playerMap.get(teamAPlayer2.playerId);
        
        // Team B: players 2 and 3
        const teamBPlayer1 = finalResultsWithPoints[2];
        const teamBPlayer2 = finalResultsWithPoints[3];
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
              matchId: newMatch.id,
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
              matchId: newMatch.id,
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
        
        // Fetch the complete match with team results
        return await tx.match.findUnique({
          where: { id: newMatch.id },
          include: {
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
      } else {
        // For singles matches, create individual match results
        await tx.matchResult.createMany({
          data: finalResultsWithPoints.map(result => ({
            matchId: newMatch.id,
            playerId: result.playerId,
            outcome: result.outcome,
            goalsScored: result.goalsScored,
            goalsConceded: result.goalsConceded,
            pointsEarned: result.pointsEarned,
            basePoints: result.basePoints,
            conditionalPoints: result.conditionalPoints,
          })),
        });

        // Fetch the complete match with results
        return await tx.match.findUnique({
          where: { id: newMatch.id },
          include: {
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
          },
        });
      }
    });

    // Update player statistics (only for singles matches)
    if (!isTeamMatch) {
      await updatePlayerStatistics(tournamentId, playerIds);
    }

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
