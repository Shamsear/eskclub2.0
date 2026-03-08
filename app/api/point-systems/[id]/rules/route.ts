import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { conditionalRuleSchema } from "@/lib/validations/point-system";
import {
  createErrorResponse,
  UnauthorizedError,
  NotFoundError,
} from "@/lib/errors";

/**
 * POST /api/point-systems/[id]/rules - Add a conditional rule to a template
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export async function POST(
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

    // Verify template exists
    const template = await prisma.pointSystemTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundError("Point system template");
    }

    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = conditionalRuleSchema.safeParse(body);

    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { conditionType, operator, threshold, pointAdjustment } =
      validationResult.data;

    // Create conditional rule
    const rule = await prisma.conditionalRule.create({
      data: {
        templateId,
        conditionType,
        operator,
        threshold,
        pointAdjustment,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
