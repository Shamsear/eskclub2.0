import { z } from "zod";
import { RuleConditionType, ComparisonOperator } from "@prisma/client";

/**
 * Validation schema for creating a point system template
 * Requirements: 1.2, 1.4, 1.5, 8.1, 8.2, 8.3
 */
export const pointSystemTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z.string().optional().nullable(),
  pointsPerWin: z
    .number({
      required_error: "Points per win is required",
      invalid_type_error: "Points per win must be a number",
    })
    .int("Points per win must be an integer"),
  pointsPerDraw: z
    .number({
      required_error: "Points per draw is required",
      invalid_type_error: "Points per draw must be a number",
    })
    .int("Points per draw must be an integer"),
  pointsPerLoss: z
    .number({
      required_error: "Points per loss is required",
      invalid_type_error: "Points per loss must be a number",
    })
    .int("Points per loss must be an integer"),
  pointsPerGoalScored: z
    .number({
      required_error: "Points per goal scored is required",
      invalid_type_error: "Points per goal scored must be a number",
    })
    .int("Points per goal scored must be an integer"),
  pointsPerGoalConceded: z
    .number({
      required_error: "Points per goal conceded is required",
      invalid_type_error: "Points per goal conceded must be a number",
    })
    .int("Points per goal conceded must be an integer"),
  pointsForWalkoverWin: z
    .number({
      invalid_type_error: "Points for walkover win must be a number",
    })
    .int("Points for walkover win must be an integer")
    .optional(),
  pointsForWalkoverLoss: z
    .number({
      invalid_type_error: "Points for walkover loss must be a number",
    })
    .int("Points for walkover loss must be an integer")
    .optional(),
  pointsPerStageWin: z
    .number({
      invalid_type_error: "Points per stage win must be a number",
    })
    .int("Points per stage win must be an integer")
    .optional(),
  pointsPerStageDraw: z
    .number({
      invalid_type_error: "Points per stage draw must be a number",
    })
    .int("Points per stage draw must be an integer")
    .optional(),
  pointsPerCleanSheet: z
    .number({
      invalid_type_error: "Points per clean sheet must be a number",
    })
    .int("Points per clean sheet must be an integer")
    .optional(),
});

/**
 * Validation schema for updating a point system template
 * Requirements: 1.2, 1.4, 1.5, 8.1, 8.2, 8.3
 */
export const pointSystemTemplateUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .optional(),
  description: z.string().optional().nullable(),
  pointsPerWin: z
    .number({
      invalid_type_error: "Points per win must be a number",
    })
    .int("Points per win must be an integer")
    .optional(),
  pointsPerDraw: z
    .number({
      invalid_type_error: "Points per draw must be a number",
    })
    .int("Points per draw must be an integer")
    .optional(),
  pointsPerLoss: z
    .number({
      invalid_type_error: "Points per loss must be a number",
    })
    .int("Points per loss must be an integer")
    .optional(),
  pointsPerGoalScored: z
    .number({
      invalid_type_error: "Points per goal scored must be a number",
    })
    .int("Points per goal scored must be an integer")
    .optional(),
  pointsPerGoalConceded: z
    .number({
      invalid_type_error: "Points per goal conceded must be a number",
    })
    .int("Points per goal conceded must be an integer")
    .optional(),
  pointsForWalkoverWin: z
    .number({
      invalid_type_error: "Points for walkover win must be a number",
    })
    .int("Points for walkover win must be an integer")
    .optional(),
  pointsForWalkoverLoss: z
    .number({
      invalid_type_error: "Points for walkover loss must be a number",
    })
    .int("Points for walkover loss must be an integer")
    .optional(),
  pointsPerStageWin: z
    .number({
      invalid_type_error: "Points per stage win must be a number",
    })
    .int("Points per stage win must be an integer")
    .optional(),
  pointsPerStageDraw: z
    .number({
      invalid_type_error: "Points per stage draw must be a number",
    })
    .int("Points per stage draw must be an integer")
    .optional(),
  pointsPerCleanSheet: z
    .number({
      invalid_type_error: "Points per clean sheet must be a number",
    })
    .int("Points per clean sheet must be an integer")
    .optional(),
});

/**
 * Validation schema for creating a conditional rule
 * Requirements: 5.2, 5.3, 5.4, 5.5, 8.1, 8.2, 8.3
 */
export const conditionalRuleSchema = z
  .object({
    conditionType: z.nativeEnum(RuleConditionType, {
      errorMap: () => ({
        message:
          "Condition type must be one of: GOALS_SCORED_THRESHOLD, GOALS_CONCEDED_THRESHOLD, GOAL_DIFFERENCE_THRESHOLD, CLEAN_SHEET",
      }),
    }),
    operator: z.nativeEnum(ComparisonOperator, {
      errorMap: () => ({
        message:
          "Operator must be one of: EQUALS, GREATER_THAN, LESS_THAN, GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL",
      }),
    }),
    threshold: z
      .number({
        required_error: "Threshold is required",
        invalid_type_error: "Threshold must be a number",
      })
      .int("Threshold must be an integer"),
    pointAdjustment: z
      .number({
        required_error: "Point adjustment is required",
        invalid_type_error: "Point adjustment must be a number",
      })
      .int("Point adjustment must be an integer"),
  })
  .refine(
    (data) => {
      // For goal-based conditions, threshold must be non-negative
      if (
        data.conditionType === RuleConditionType.GOALS_SCORED_THRESHOLD ||
        data.conditionType === RuleConditionType.GOALS_CONCEDED_THRESHOLD ||
        data.conditionType === RuleConditionType.GOAL_DIFFERENCE_THRESHOLD
      ) {
        return data.threshold >= 0;
      }
      return true;
    },
    {
      message: "Threshold must be non-negative for goal-based conditions",
      path: ["threshold"],
    }
  )
  .refine(
    (data) => {
      // Clean sheet condition must use EQUALS operator with threshold 0
      if (data.conditionType === RuleConditionType.CLEAN_SHEET) {
        return (
          data.operator === ComparisonOperator.EQUALS && data.threshold === 0
        );
      }
      return true;
    },
    {
      message:
        "Clean sheet condition must use EQUALS operator with threshold 0",
      path: ["operator"],
    }
  );

/**
 * Validation schema for updating a conditional rule
 * Requirements: 6.2, 6.3, 8.1, 8.2, 8.3
 */
export const conditionalRuleUpdateSchema = z
  .object({
    conditionType: z
      .nativeEnum(RuleConditionType, {
        errorMap: () => ({
          message:
            "Condition type must be one of: GOALS_SCORED_THRESHOLD, GOALS_CONCEDED_THRESHOLD, GOAL_DIFFERENCE_THRESHOLD, CLEAN_SHEET",
        }),
      })
      .optional(),
    operator: z
      .nativeEnum(ComparisonOperator, {
        errorMap: () => ({
          message:
            "Operator must be one of: EQUALS, GREATER_THAN, LESS_THAN, GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL",
        }),
      })
      .optional(),
    threshold: z
      .number({
        invalid_type_error: "Threshold must be a number",
      })
      .int("Threshold must be an integer")
      .optional(),
    pointAdjustment: z
      .number({
        invalid_type_error: "Point adjustment must be a number",
      })
      .int("Point adjustment must be an integer")
      .optional(),
  })
  .refine(
    (data) => {
      // For goal-based conditions, threshold must be non-negative
      if (
        data.threshold !== undefined &&
        data.conditionType &&
        (data.conditionType === RuleConditionType.GOALS_SCORED_THRESHOLD ||
          data.conditionType === RuleConditionType.GOALS_CONCEDED_THRESHOLD ||
          data.conditionType === RuleConditionType.GOAL_DIFFERENCE_THRESHOLD)
      ) {
        return data.threshold >= 0;
      }
      return true;
    },
    {
      message: "Threshold must be non-negative for goal-based conditions",
      path: ["threshold"],
    }
  )
  .refine(
    (data) => {
      // Clean sheet condition must use EQUALS operator with threshold 0
      if (
        data.conditionType === RuleConditionType.CLEAN_SHEET &&
        (data.operator !== undefined || data.threshold !== undefined)
      ) {
        const operator = data.operator ?? ComparisonOperator.EQUALS;
        const threshold = data.threshold ?? 0;
        return operator === ComparisonOperator.EQUALS && threshold === 0;
      }
      return true;
    },
    {
      message:
        "Clean sheet condition must use EQUALS operator with threshold 0",
      path: ["operator"],
    }
  );

// Type exports for use in API routes and components
export type PointSystemTemplateInput = z.infer<
  typeof pointSystemTemplateSchema
>;
export type PointSystemTemplateUpdateInput = z.infer<
  typeof pointSystemTemplateUpdateSchema
>;
export type ConditionalRuleInput = z.infer<typeof conditionalRuleSchema>;
export type ConditionalRuleUpdateInput = z.infer<
  typeof conditionalRuleUpdateSchema
>;
