import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pointSystemTemplateUpdateSchema } from "@/lib/validations/point-system";
import {
  createErrorResponse,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from "@/lib/errors";

/**
 * GET /api/point-systems/[id] - Get a single point system template
 * Requirements: 2.2, 3.1
 */
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
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      throw new NotFoundError("Point system template");
    }

    // Fetch template by ID with all conditional rules
    const template = await prisma.pointSystemTemplate.findUnique({
      where: { id: templateId },
      include: {
        conditionalRules: {
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            tournaments: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundError("Point system template");
    }

    return NextResponse.json(template);
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * PUT /api/point-systems/[id] - Update a point system template
 * Requirements: 3.1, 3.2, 3.3
 */
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
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      throw new NotFoundError("Point system template");
    }

    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = pointSystemTemplateUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      throw validationResult.error;
    }

    const data = validationResult.data;

    // Check if template exists
    const existingTemplate = await prisma.pointSystemTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      throw new NotFoundError("Point system template");
    }

    // Check name uniqueness (excluding current template)
    if (data.name && data.name !== existingTemplate.name) {
      const duplicateTemplate = await prisma.pointSystemTemplate.findUnique({
        where: { name: data.name },
      });

      if (duplicateTemplate) {
        throw new ConflictError(
          "A point system template with this name already exists"
        );
      }
    }

    // Build update data object
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.pointsPerWin !== undefined) updateData.pointsPerWin = data.pointsPerWin;
    if (data.pointsPerDraw !== undefined) updateData.pointsPerDraw = data.pointsPerDraw;
    if (data.pointsPerLoss !== undefined) updateData.pointsPerLoss = data.pointsPerLoss;
    if (data.pointsPerGoalScored !== undefined) updateData.pointsPerGoalScored = data.pointsPerGoalScored;
    if (data.pointsPerGoalConceded !== undefined) updateData.pointsPerGoalConceded = data.pointsPerGoalConceded;
    if (data.pointsForWalkoverWin !== undefined) updateData.pointsForWalkoverWin = data.pointsForWalkoverWin;
    if (data.pointsForWalkoverLoss !== undefined) updateData.pointsForWalkoverLoss = data.pointsForWalkoverLoss;
    if (data.pointsPerStageWin !== undefined) updateData.pointsPerStageWin = data.pointsPerStageWin;
    if (data.pointsPerStageDraw !== undefined) updateData.pointsPerStageDraw = data.pointsPerStageDraw;
    if (data.pointsPerCleanSheet !== undefined) updateData.pointsPerCleanSheet = data.pointsPerCleanSheet;

    // Update template in database
    const updatedTemplate = await prisma.pointSystemTemplate.update({
      where: { id: templateId },
      data: updateData,
      include: {
        conditionalRules: true,
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * DELETE /api/point-systems/[id] - Delete a point system template
 * Requirements: 2.3, 2.4, 2.5
 */
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
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      throw new NotFoundError("Point system template");
    }

    // Check if template exists
    const template = await prisma.pointSystemTemplate.findUnique({
      where: { id: templateId },
      include: {
        tournaments: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundError("Point system template");
    }

    // Check if template is assigned to any tournaments
    if (template.tournaments.length > 0) {
      throw new ConflictError(
        `Cannot delete template: currently assigned to ${template.tournaments.length} tournament(s). ` +
          `Affected tournaments: ${template.tournaments.map((t) => t.name).join(", ")}`
      );
    }

    // Delete template (cascade deletes conditional rules)
    await prisma.pointSystemTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({
      message: "Point system template deleted successfully",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
