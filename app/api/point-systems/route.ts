import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pointSystemTemplateSchema } from "@/lib/validations/point-system";
import {
  createErrorResponse,
  UnauthorizedError,
  ConflictError,
} from "@/lib/errors";

/**
 * POST /api/point-systems - Create a new point system template
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = pointSystemTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      throw validationResult.error;
    }

    const {
      name,
      description,
      pointsPerWin,
      pointsPerDraw,
      pointsPerLoss,
      pointsPerGoalScored,
      pointsPerGoalConceded,
      pointsForWalkoverWin,
      pointsForWalkoverLoss,
      pointsPerStageWin,
      pointsPerStageDraw,
      pointsPerCleanSheet,
    } = validationResult.data;

    // Extract conditional rules if provided
    const conditionalRules = body.conditionalRules || [];

    // Check for name uniqueness
    const existingTemplate = await prisma.pointSystemTemplate.findUnique({
      where: { name },
    });

    if (existingTemplate) {
      throw new ConflictError(
        "A point system template with this name already exists"
      );
    }

    // Create template in database with conditional rules
    const template = await prisma.pointSystemTemplate.create({
      data: {
        name,
        description: description || null,
        pointsPerWin,
        pointsPerDraw,
        pointsPerLoss,
        pointsPerGoalScored,
        pointsPerGoalConceded,
        pointsForWalkoverWin: pointsForWalkoverWin ?? 3,
        pointsForWalkoverLoss: pointsForWalkoverLoss ?? -3,
        pointsPerStageWin: pointsPerStageWin ?? 0,
        pointsPerStageDraw: pointsPerStageDraw ?? 0,
        pointsPerCleanSheet: pointsPerCleanSheet ?? 0,
        conditionalRules: {
          create: conditionalRules.map((rule: any) => ({
            conditionType: rule.conditionType,
            operator: rule.operator,
            threshold: rule.threshold,
            pointAdjustment: rule.pointAdjustment,
          })),
        },
      },
      include: {
        conditionalRules: true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * GET /api/point-systems - List all point system templates
 * Requirements: 2.1, 2.2
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Cap at 100
    const skip = (validPage - 1) * validLimit;

    // Build where clause for search
    const where = search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    // Get total count for pagination
    const total = await prisma.pointSystemTemplate.count({ where });

    // Fetch templates with pagination
    const templates = await prisma.pointSystemTemplate.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: validLimit,
      select: {
        id: true,
        name: true,
        description: true,
        tournamentType: true,
        numberOfTeams: true,
        pointsPerWin: true,
        pointsPerDraw: true,
        pointsPerLoss: true,
        pointsPerGoalScored: true,
        pointsPerGoalConceded: true,
        pointsForWalkoverWin: true,
        pointsForWalkoverLoss: true,
        createdAt: true,
        updatedAt: true,
        stagePoints: {
          select: {
            id: true,
            stageId: true,
            stageName: true,
            stageOrder: true,
            pointsPerWin: true,
            pointsPerDraw: true,
            pointsPerLoss: true,
            pointsPerGoalScored: true,
            pointsPerGoalConceded: true,
          },
          orderBy: {
            stageOrder: 'asc',
          },
        },
        _count: {
          select: {
            conditionalRules: true,
            tournaments: true,
          },
        },
      },
    });

    return NextResponse.json({
      templates,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit),
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
