import { prisma } from "./prisma";
import { MatchOutcome, RuleConditionType, ComparisonOperator } from "@prisma/client";

export interface PointSystem {
  pointsPerWin: number;
  pointsPerDraw: number;
  pointsPerLoss: number;
  pointsPerGoalScored: number;
  pointsPerGoalConceded: number;
}

export interface ConditionalRule {
  id: number;
  conditionType: RuleConditionType;
  operator: ComparisonOperator;
  threshold: number;
  pointAdjustment: number;
}

export interface PointSystemConfig extends PointSystem {
  conditionalRules?: ConditionalRule[];
  pointsForWalkoverWin?: number;
  pointsForWalkoverLoss?: number;
}

export interface MatchResultData {
  playerId?: number;
  outcome: MatchOutcome;
  goalsScored: number;
  goalsConceded: number;
}

export interface AppliedRule {
  ruleId: number;
  pointAdjustment: number;
}

export interface PointCalculationResult {
  basePoints: number;
  conditionalPoints: number;
  totalPoints: number;
  appliedRules: AppliedRule[];
}

/**
 * Evaluate a conditional rule against match result data
 */
function evaluateConditionalRule(
  result: MatchResultData,
  rule: ConditionalRule
): boolean {
  let value: number;

  // Extract the relevant metric based on condition type
  switch (rule.conditionType) {
    case RuleConditionType.GOALS_SCORED_THRESHOLD:
      value = result.goalsScored;
      break;
    case RuleConditionType.GOALS_CONCEDED_THRESHOLD:
      value = result.goalsConceded;
      break;
    case RuleConditionType.GOAL_DIFFERENCE_THRESHOLD:
      value = result.goalsScored - result.goalsConceded;
      break;
    case RuleConditionType.CLEAN_SHEET:
      value = result.goalsConceded;
      break;
    default:
      return false;
  }

  // Apply the comparison operator
  switch (rule.operator) {
    case ComparisonOperator.EQUALS:
      return value === rule.threshold;
    case ComparisonOperator.GREATER_THAN:
      return value > rule.threshold;
    case ComparisonOperator.LESS_THAN:
      return value < rule.threshold;
    case ComparisonOperator.GREATER_THAN_OR_EQUAL:
      return value >= rule.threshold;
    case ComparisonOperator.LESS_THAN_OR_EQUAL:
      return value <= rule.threshold;
    default:
      return false;
  }
}

/**
 * Calculate points with detailed breakdown including conditional rules
 */
export function calculatePointsWithRules(
  result: MatchResultData,
  config: PointSystemConfig
): PointCalculationResult {
  // Calculate base points
  let basePoints = 0;

  // Add points based on outcome
  switch (result.outcome) {
    case MatchOutcome.WIN:
      basePoints += config.pointsPerWin;
      break;
    case MatchOutcome.DRAW:
      basePoints += config.pointsPerDraw;
      break;
    case MatchOutcome.LOSS:
      basePoints += config.pointsPerLoss;
      break;
  }

  // Add points for goals scored
  basePoints += result.goalsScored * config.pointsPerGoalScored;

  // Add points for goals conceded (can be negative)
  basePoints += result.goalsConceded * config.pointsPerGoalConceded;

  // Evaluate conditional rules
  const appliedRules: AppliedRule[] = [];
  let conditionalPoints = 0;

  if (config.conditionalRules && config.conditionalRules.length > 0) {
    for (const rule of config.conditionalRules) {
      if (evaluateConditionalRule(result, rule)) {
        appliedRules.push({
          ruleId: rule.id,
          pointAdjustment: rule.pointAdjustment,
        });
        conditionalPoints += rule.pointAdjustment;
      }
    }
  }

  // Calculate total points
  const totalPoints = basePoints + conditionalPoints;

  return {
    basePoints,
    conditionalPoints,
    totalPoints,
    appliedRules,
  };
}

/**
 * Calculate points earned for a match result based on tournament's point system
 * (Backward compatible version - returns only total points)
 */
export function calculatePoints(
  result: MatchResultData,
  pointSystem: PointSystem | PointSystemConfig
): number {
  // If the point system has conditional rules, use the enhanced calculation
  if ('conditionalRules' in pointSystem && pointSystem.conditionalRules) {
    const detailedResult = calculatePointsWithRules(result, pointSystem);
    return detailedResult.totalPoints;
  }

  // Otherwise, use the simple calculation (backward compatibility)
  let points = 0;

  // Add points based on outcome
  switch (result.outcome) {
    case MatchOutcome.WIN:
      points += pointSystem.pointsPerWin;
      break;
    case MatchOutcome.DRAW:
      points += pointSystem.pointsPerDraw;
      break;
    case MatchOutcome.LOSS:
      points += pointSystem.pointsPerLoss;
      break;
  }

  // Add points for goals scored
  points += result.goalsScored * pointSystem.pointsPerGoalScored;

  // Subtract points for goals conceded (or add if negative points)
  points += result.goalsConceded * pointSystem.pointsPerGoalConceded;

  return points;
}

/**
 * Update tournament player statistics after match results are added/updated
 */
export async function updatePlayerStatistics(
  tournamentId: number,
  playerIds: number[]
) {
  // Get all match results for these players in this tournament
  const matchResults = await prisma.matchResult.findMany({
    where: {
      playerId: { in: playerIds },
      match: {
        tournamentId,
      },
    },
    select: {
      playerId: true,
      outcome: true,
      goalsScored: true,
      goalsConceded: true,
      pointsEarned: true,
      basePoints: true,
      conditionalPoints: true,
    },
  });

  // Group results by player (filter out null playerIds for external players)
  const playerResultsMap = new Map<number, typeof matchResults>();
  for (const result of matchResults) {
    if (result.playerId !== null) {
      if (!playerResultsMap.has(result.playerId)) {
        playerResultsMap.set(result.playerId, []);
      }
      playerResultsMap.get(result.playerId)!.push(result);
    }
  }

  // Update statistics for each player
  for (const playerId of playerIds) {
    const results = playerResultsMap.get(playerId) || [];

    const stats = {
      matchesPlayed: results.length,
      wins: results.filter(r => r.outcome === MatchOutcome.WIN).length,
      draws: results.filter(r => r.outcome === MatchOutcome.DRAW).length,
      losses: results.filter(r => r.outcome === MatchOutcome.LOSS).length,
      goalsScored: results.reduce((sum, r) => sum + r.goalsScored, 0),
      goalsConceded: results.reduce((sum, r) => sum + r.goalsConceded, 0),
      totalPoints: results.reduce((sum, r) => sum + r.pointsEarned, 0),
      conditionalPoints: results.reduce((sum, r) => sum + r.conditionalPoints, 0),
    };

    // Upsert player statistics
    await prisma.tournamentPlayerStats.upsert({
      where: {
        tournamentId_playerId: {
          tournamentId,
          playerId,
        },
      },
      create: {
        tournamentId,
        playerId,
        ...stats,
      },
      update: stats,
    });
  }
}

/**
 * Recalculate all statistics for a tournament
 * Useful when match results are deleted or bulk updated
 */
export async function recalculateTournamentStatistics(tournamentId: number) {
  // Get all participants in the tournament
  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId },
    select: { playerId: true },
  });

  const playerIds = participants.map(p => p.playerId);

  if (playerIds.length === 0) {
    return;
  }

  await updatePlayerStatistics(tournamentId, playerIds);
}
