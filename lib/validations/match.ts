import { z } from "zod";
import { MatchOutcome } from "@prisma/client";

// Schema for a single match result
export const matchResultSchema = z.object({
  playerId: z.number().int().positive("Player ID must be a positive integer"),
  outcome: z.nativeEnum(MatchOutcome, {
    errorMap: () => ({ message: "Outcome must be WIN, DRAW, or LOSS" }),
  }),
  goalsScored: z.number().int().min(0, "Goals scored must be non-negative"),
  goalsConceded: z.number().int().min(0, "Goals conceded must be non-negative"),
  customPoints: z.number().int().optional(), // Optional custom point override
});

// Schema for creating a match with results
export const matchCreateSchema = z.object({
  matchDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid match date format",
  }),
  stageId: z.union([z.number().int().positive("Stage ID must be a positive integer"), z.null()]).optional(),
  stageName: z.union([z.string(), z.null()]).optional(),
  walkoverWinnerId: z.number().int().nullable().optional(), // null = normal, 0 = both forfeit, playerId = winner
  results: z.array(matchResultSchema).min(1, "At least one match result is required"),
  matchFormat: z.enum(['SINGLES', 'DOUBLES']).optional(), // Optional match format hint
}).refine((data) => {
  // Check for duplicate player IDs
  const playerIds = data.results.map(r => r.playerId);
  const uniquePlayerIds = new Set(playerIds);
  return playerIds.length === uniquePlayerIds.size;
}, {
  message: "Duplicate player IDs are not allowed in match results",
  path: ["results"],
}).refine((data) => {
  // Validate player count based on match format
  if (data.matchFormat === 'DOUBLES' && data.results.length !== 4) {
    return false;
  }
  if (data.matchFormat === 'SINGLES' && data.results.length !== 2) {
    return false;
  }
  return true;
}, {
  message: "Invalid number of players for match format (Singles: 2 players, Doubles: 4 players)",
  path: ["results"],
});

// Schema for updating a match
export const matchUpdateSchema = z.object({
  matchDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid match date format",
  }).optional(),
  stageId: z.union([z.number().int().positive("Stage ID must be a positive integer"), z.null()]).optional(),
  stageName: z.union([z.string(), z.null()]).optional(),
  walkoverWinnerId: z.number().int().nullable().optional(), // null = normal, 0 = both forfeit, playerId = winner
  results: z.array(matchResultSchema).min(1, "At least one match result is required").optional(),
}).refine((data) => {
  // Check for duplicate player IDs if results are provided
  if (data.results) {
    const playerIds = data.results.map(r => r.playerId);
    const uniquePlayerIds = new Set(playerIds);
    return playerIds.length === uniquePlayerIds.size;
  }
  return true;
}, {
  message: "Duplicate player IDs are not allowed in match results",
  path: ["results"],
});

export type MatchResultInput = z.infer<typeof matchResultSchema>;
export type MatchCreateInput = z.infer<typeof matchCreateSchema>;
export type MatchUpdateInput = z.infer<typeof matchUpdateSchema>;
