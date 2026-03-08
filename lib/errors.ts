/**
 * Centralized error handling utilities for the application
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Custom error types for the application
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

/**
 * Error logger - logs errors with context
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
  };

  // In production, you would send this to a logging service
  console.error("[ERROR]", JSON.stringify(errorInfo, null, 2));
}

/**
 * Format Zod validation errors into a user-friendly format
 */
export function formatZodError(error: ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

/**
 * Handle Prisma errors and convert them to AppErrors
 */
export function handlePrismaError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        // Unique constraint violation
        const target = (error.meta?.target as string[]) || [];
        const field = target[0] || "field";
        return new ConflictError(`A record with this ${field} already exists`);
      
      case "P2025":
        // Record not found
        return new NotFoundError("Resource");
      
      case "P2003":
        // Foreign key constraint violation
        return new ValidationError("Invalid reference to related resource");
      
      default:
        return new AppError("Database operation failed", 500, error.code);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError("Invalid data provided");
  }

  return new AppError("An unexpected database error occurred");
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: unknown): NextResponse {
  // Log the error
  logError(error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: formatZodError(error),
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    const appError = handlePrismaError(error);
    return NextResponse.json(
      {
        error: appError.message,
        code: appError.code,
      },
      { status: appError.statusCode }
    );
  }

  // Handle custom AppErrors
  if (error instanceof AppError) {
    const response: any = {
      error: error.message,
      code: error.code,
    };

    if (error instanceof ValidationError && error.details) {
      response.details = error.details;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  // Unknown error type
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  );
}

/**
 * Validate that at least one role is selected
 */
export function validateRoles(roles: string[] | undefined): void {
  if (!roles || roles.length === 0) {
    throw new ValidationError("At least one role must be selected", {
      roles: ["At least one role is required"],
    });
  }
}

/**
 * User-friendly error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You must be logged in to perform this action",
  FORBIDDEN: "You don't have permission to perform this action",
  NOT_FOUND: "The requested resource was not found",
  VALIDATION_FAILED: "Please check your input and try again",
  DUPLICATE_EMAIL: "A user with this email already exists",
  DUPLICATE_ENTRY: "This entry already exists",
  SERVER_ERROR: "Something went wrong. Please try again later",
  NETWORK_ERROR: "Unable to connect. Please check your internet connection",
  ROLE_REQUIRED: "At least one role must be selected",
} as const;
