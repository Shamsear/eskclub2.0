import { z } from "zod";

export const statisticsSchema = z.object({
  gamesPlayed: z.number().int().min(0, "Games played must be a non-negative integer").default(0),
  goalsScored: z.number().int().min(0, "Goals scored must be a non-negative integer").default(0),
  assists: z.number().int().min(0, "Assists must be a non-negative integer").default(0),
  yellowCards: z.number().int().min(0, "Yellow cards must be a non-negative integer").default(0),
  redCards: z.number().int().min(0, "Red cards must be a non-negative integer").default(0),
  minutesPlayed: z.number().int().min(0, "Minutes played must be a non-negative integer").default(0),
  season: z.string().max(20, "Season must be 20 characters or less").optional().nullable(),
});

export const statisticsUpdateSchema = z.object({
  gamesPlayed: z.number().int().min(0, "Games played must be a non-negative integer").optional(),
  goalsScored: z.number().int().min(0, "Goals scored must be a non-negative integer").optional(),
  assists: z.number().int().min(0, "Assists must be a non-negative integer").optional(),
  yellowCards: z.number().int().min(0, "Yellow cards must be a non-negative integer").optional(),
  redCards: z.number().int().min(0, "Red cards must be a non-negative integer").optional(),
  minutesPlayed: z.number().int().min(0, "Minutes played must be a non-negative integer").optional(),
  season: z.string().max(20, "Season must be 20 characters or less").optional().nullable(),
});

export type StatisticsInput = z.infer<typeof statisticsSchema>;
export type StatisticsUpdateInput = z.infer<typeof statisticsUpdateSchema>;
