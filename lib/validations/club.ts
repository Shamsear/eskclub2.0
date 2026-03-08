import { z } from "zod";

export const clubSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  logo: z.string().max(255, "Logo URL must be 255 characters or less").optional().nullable(),
  description: z.string().optional().nullable(),
});

export const clubUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less").optional(),
  logo: z.string().max(255, "Logo URL must be 255 characters or less").optional().nullable(),
  description: z.string().optional().nullable(),
});

export type ClubInput = z.infer<typeof clubSchema>;
export type ClubUpdateInput = z.infer<typeof clubUpdateSchema>;
