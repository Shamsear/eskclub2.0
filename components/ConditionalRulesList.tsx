'use client';

import { Button } from './ui/Button';
import { ConditionalRule, RuleConditionType, ComparisonOperator } from './ConditionalRuleModal';

interface ConditionalRulesListProps {
  rules: ConditionalRule[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  isLoading?: boolean;
}

const conditionTypeLabels: Record<RuleConditionType, string> = {
  [RuleConditionType.GOALS_SCORED_THRESHOLD]: 'Goals Scored',
  [RuleConditionType.GOALS_CONCEDED_THRESHOLD]: 'Goals Conceded',
  [RuleConditionType.GOAL_DIFFERENCE_THRESHOLD]: 'Goal Difference',
  [RuleConditionType.CLEAN_SHEET]: 'Clean Sheet',
};

const operatorSymbols: Record<ComparisonOperator, string> = {
  [ComparisonOperator.EQUALS]: '=',
  [ComparisonOperator.GREATER_THAN]: '>',
  [ComparisonOperator.LESS_THAN]: '<',
  [ComparisonOperator.GREATER_THAN_OR_EQUAL]: '≥',
  [ComparisonOperator.LESS_THAN_OR_EQUAL]: '≤',
};

export function ConditionalRulesList({
  rules,
  onEdit,
  onDelete,
  isLoading = false,
}: ConditionalRulesListProps) {
  if (rules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No conditional rules added yet.</p>
        <p className="text-xs mt-1">Add rules to award or deduct points based on specific conditions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule, index) => (
        <div
          key={rule.id || index}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {conditionTypeLabels[rule.conditionType]}
              </span>
              <span className="text-sm text-gray-600">
                {operatorSymbols[rule.operator]}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {rule.threshold}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Point adjustment:{' '}
              <span className={`font-medium ${rule.pointAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {rule.pointAdjustment >= 0 ? '+' : ''}{rule.pointAdjustment}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(index)}
              disabled={isLoading}
              aria-label={`Edit rule: ${conditionTypeLabels[rule.conditionType]}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              disabled={isLoading}
              aria-label={`Delete rule: ${conditionTypeLabels[rule.conditionType]}`}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
