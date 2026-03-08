import { z } from "zod";

export const tournamentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().optional().nullable(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date format",
  }).optional().nullable(),
  matchFormat: z.enum(['SINGLES', 'DOUBLES']).default('SINGLES'),
  pointSystemTemplateId: z.number().int().positive().optional().nullable(),
  pointsPerWin: z.number().int().min(0, "Points per win must be non-negative").default(3),
  pointsPerDraw: z.number().int().min(0, "Points per draw must be non-negative").default(1),
  pointsPerLoss: z.number().int().min(0, "Points per loss must be non-negative").default(0),
  pointsPerGoalScored: z.number().int().min(0, "Points per goal scored must be non-negative").default(0),
  pointsPerGoalConceded: z.number().int().min(0, "Points per goal conceded must be non-negative").default(0),
}).refine((data) => {
  if (data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  }
  return true;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export const tournamentUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less").optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }).optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date format",
  }).optional().nullable(),
  matchFormat: z.enum(['SINGLES', 'DOUBLES']).optional(),
  pointSystemTemplateId: z.number().int().positive().optional().nullable(),
  pointsPerWin: z.number().int().min(0, "Points per win must be non-negative").optional(),
  pointsPerDraw: z.number().int().min(0, "Points per draw must be non-negative").optional(),
  pointsPerLoss: z.number().int().min(0, "Points per loss must be non-negative").optional(),
  pointsPerGoalScored: z.number().int().min(0, "Points per goal scored must be non-negative").optional(),
  pointsPerGoalConceded: z.number().int().min(0, "Points per goal conceded must be non-negative").optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  }
  return true;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export type TournamentInput = z.infer<typeof tournamentSchema>;
export type TournamentUpdateInput = z.infer<typeof tournamentUpdateSchema>;
