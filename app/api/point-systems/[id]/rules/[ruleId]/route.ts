import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { conditionalRuleUpdateSchema } from "@/lib/validations/point-system";
import {
  createErrorResponse,
  UnauthorizedError,
  NotFoundError,
} from "@/lib/errors";

/**
 * PUT /api/point-systems/[id]/rules/[ruleId] - Update a conditional rule
 * Requirements: 6.2, 6.3
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { id, ruleId: ruleIdStr } = await params;
    const templateId = parseInt(id, 10);
    const ruleId = parseInt(ruleIdStr, 10);

    if (isNaN(templateId)) {
      throw new NotFoundError("Point system template");
    }

    if (isNaN(ruleId)) {
      throw new NotFoundError("Conditional rule");
    }

    // Verify template exists
    const template = await prisma.pointSystemTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundError("Point system template");
    }

    // Verify rule exists and belongs to the template
    const existingRule = await prisma.conditionalRule.findUnique({
      where: { id: ruleId },
    });

    if (!existingRule) {
      throw new NotFoundError("Conditional rule");
    }

    if (existingRule.templateId !== templateId) {
      throw new NotFoundError("Conditional rule");
    }

    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = conditionalRuleUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      throw validationResult.error;
    }

    const data = validationResult.data;

    // Update rule
    const updatedRule = await prisma.conditionalRule.update({
      where: { id: ruleId },
      data: {
        ...(data.conditionType !== undefined && {
          conditionType: data.conditionType,
        }),
        ...(data.operator !== undefined && { operator: data.operator }),
        ...(data.threshold !== undefined && { threshold: data.threshold }),
        ...(data.pointAdjustment !== undefined && {
          pointAdjustment: data.pointAdjustment,
        }),
      },
    });

    return NextResponse.json(updatedRule);
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * DELETE /api/point-systems/[id]/rules/[ruleId] - Delete a conditional rule
 * Requirements: 6.2, 6.4
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { id, ruleId: ruleIdStr } = await params;
    const templateId = parseInt(id, 10);
    const ruleId = parseInt(ruleIdStr, 10);

    if (isNaN(templateId)) {
      throw new NotFoundError("Point system template");
    }

    if (isNaN(ruleId)) {
      throw new NotFoundError("Conditional rule");
    }

    // Verify template exists
    const template = await prisma.pointSystemTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundError("Point system template");
    }

    // Verify rule exists and belongs to the template
    const existingRule = await prisma.conditionalRule.findUnique({
      where: { id: ruleId },
    });

    if (!existingRule) {
      throw new NotFoundError("Conditional rule");
    }

    if (existingRule.templateId !== templateId) {
      throw new NotFoundError("Conditional rule");
    }

    // Delete rule
    await prisma.conditionalRule.delete({
      where: { id: ruleId },
    });

    return NextResponse.json({
      message: "Conditional rule deleted successfully",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
