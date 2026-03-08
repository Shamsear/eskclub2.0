import { z } from "zod";
import { RoleType } from "@prisma/client";

export const playerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  email: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().email("Invalid email format").max(100, "Email must be 100 characters or less").optional()
  ),
  phone: z.string().max(20, "Phone must be 20 characters or less").optional().nullable(),
  place: z.string().max(100, "Place must be 100 characters or less").optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  photo: z.string().max(255, "Photo URL must be 255 characters or less").optional().nullable(),
  roles: z.array(z.nativeEnum(RoleType)).min(1, "At least one role is required"),
});

export const playerUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less").optional(),
  email: z.string().email("Invalid email format").max(100, "Email must be 100 characters or less").optional(),
  phone: z.string().max(20, "Phone must be 20 characters or less").optional().nullable(),
  place: z.string().max(100, "Place must be 100 characters or less").optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  photo: z.string().max(255, "Photo URL must be 255 characters or less").optional().nullable(),
  roles: z.array(z.nativeEnum(RoleType)).min(1, "At least one role is required").optional(),
});

// Legacy exports for backward compatibility
export const managerSchema = playerSchema;
export const managerUpdateSchema = playerUpdateSchema;

export type PlayerInput = z.infer<typeof playerSchema>;
export type PlayerUpdateInput = z.infer<typeof playerUpdateSchema>;
export type ManagerInput = PlayerInput;
export type ManagerUpdateInput = PlayerUpdateInput;
