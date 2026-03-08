'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { z } from 'zod';

// Enums matching Prisma schema
export enum RuleConditionType {
  GOALS_SCORED_THRESHOLD = 'GOALS_SCORED_THRESHOLD',
  GOALS_CONCEDED_THRESHOLD = 'GOALS_CONCEDED_THRESHOLD',
  GOAL_DIFFERENCE_THRESHOLD = 'GOAL_DIFFERENCE_THRESHOLD',
  CLEAN_SHEET = 'CLEAN_SHEET',
}

export enum ComparisonOperator {
  EQUALS = 'EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
}

export interface ConditionalRule {
  id?: number;
  conditionType: RuleConditionType;
  operator: ComparisonOperator;
  threshold: number;
  pointAdjustment: number;
}

interface ConditionalRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: ConditionalRule) => Promise<void>;
  initialData?: ConditionalRule;
  mode: 'create' | 'edit';
}

const conditionTypeLabels: Record<RuleConditionType, string> = {
  [RuleConditionType.GOALS_SCORED_THRESHOLD]: 'Goals Scored Threshold',
  [RuleConditionType.GOALS_CONCEDED_THRESHOLD]: 'Goals Conceded Threshold',
  [RuleConditionType.GOAL_DIFFERENCE_THRESHOLD]: 'Goal Difference Threshold',
  [RuleConditionType.CLEAN_SHEET]: 'Clean Sheet',
};

const operatorLabels: Record<ComparisonOperator, string> = {
  [ComparisonOperator.EQUALS]: 'Equals (=)',
  [ComparisonOperator.GREATER_THAN]: 'Greater Than (>)',
  [ComparisonOperator.LESS_THAN]: 'Less Than (<)',
  [ComparisonOperator.GREATER_THAN_OR_EQUAL]: 'Greater Than or Equal (≥)',
  [ComparisonOperator.LESS_THAN_OR_EQUAL]: 'Less Than or Equal (≤)',
};

const ruleSchema = z.object({
  conditionType: z.nativeEnum(RuleConditionType),
  operator: z.nativeEnum(ComparisonOperator),
  threshold: z.number().int('Threshold must be an integer'),
  pointAdjustment: z.number().int('Point adjustment must be an integer'),
}).refine(
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
    message: 'Threshold must be non-negative for goal-based conditions',
    path: ['threshold'],
  }
).refine(
  (data) => {
    // Clean sheet condition must use EQUALS operator with threshold 0
    if (data.conditionType === RuleConditionType.CLEAN_SHEET) {
      return data.operator === ComparisonOperator.EQUALS && data.threshold === 0;
    }
    return true;
  },
  {
    message: 'Clean sheet condition must use EQUALS operator with threshold 0',
    path: ['operator'],
  }
);

interface FormErrors {
  conditionType?: string;
  operator?: string;
  threshold?: string;
  pointAdjustment?: string;
  submit?: string;
}

export function ConditionalRuleModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: ConditionalRuleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<ConditionalRule>({
    conditionType: initialData?.conditionType || RuleConditionType.GOALS_SCORED_THRESHOLD,
    operator: initialData?.operator || ComparisonOperator.GREATER_THAN,
    threshold: initialData?.threshold ?? 0,
    pointAdjustment: initialData?.pointAdjustment ?? 0,
  });

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setFormData({
        conditionType: initialData?.conditionType || RuleConditionType.GOALS_SCORED_THRESHOLD,
        operator: initialData?.operator || ComparisonOperator.GREATER_THAN,
        threshold: initialData?.threshold ?? 0,
        pointAdjustment: initialData?.pointAdjustment ?? 0,
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Auto-adjust for clean sheet condition
  useEffect(() => {
    if (formData.conditionType === RuleConditionType.CLEAN_SHEET) {
      setFormData(prev => ({
        ...prev,
        operator: ComparisonOperator.EQUALS,
        threshold: 0,
      }));
    }
  }, [formData.conditionType]);

  const validateForm = (): boolean => {
    try {
      ruleSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path as keyof FormErrors] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save rule';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberChange = (field: 'threshold' | 'pointAdjustment', value: string) => {
    if (value === '' || value === '-') {
      setFormData({ ...formData, [field]: 0 });
      return;
    }
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setFormData({ ...formData, [field]: numValue });
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    }
  };

  const isCleanSheet = formData.conditionType === RuleConditionType.CLEAN_SHEET;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Conditional Rule' : 'Edit Conditional Rule'}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="conditionType" className="block text-sm font-medium text-gray-700 mb-1">
            Condition Type <span className="text-red-500">*</span>
          </label>
          <select
            id="conditionType"
            value={formData.conditionType}
            onChange={(e) => {
              setFormData({ ...formData, conditionType: e.target.value as RuleConditionType });
              if (errors.conditionType) {
                setErrors({ ...errors, conditionType: undefined });
              }
            }}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base text-gray-900 bg-white"
            aria-describedby={errors.conditionType ? 'conditionType-error' : undefined}
            aria-invalid={errors.conditionType ? 'true' : 'false'}
          >
            {Object.entries(conditionTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.conditionType && (
            <p id="conditionType-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.conditionType}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-1">
            Comparison Operator <span className="text-red-500">*</span>
          </label>
          <select
            id="operator"
            value={formData.operator}
            onChange={(e) => {
              setFormData({ ...formData, operator: e.target.value as ComparisonOperator });
              if (errors.operator) {
                setErrors({ ...errors, operator: undefined });
              }
            }}
            disabled={isCleanSheet}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-describedby={errors.operator ? 'operator-error' : undefined}
            aria-invalid={errors.operator ? 'true' : 'false'}
          >
            {Object.entries(operatorLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.operator && (
            <p id="operator-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.operator}
            </p>
          )}
          {isCleanSheet && (
            <p className="mt-1 text-sm text-gray-500">
              Clean sheet condition always uses EQUALS operator
            </p>
          )}
        </div>

        <Input
          label="Threshold Value"
          type="number"
          value={formData.threshold.toString()}
          onChange={(e) => handleNumberChange('threshold', e.target.value)}
          error={errors.threshold}
          helperText={isCleanSheet ? 'Clean sheet condition always uses threshold 0' : 'The value to compare against'}
          disabled={isCleanSheet}
          required
        />

        <Input
          label="Point Adjustment"
          type="number"
          value={formData.pointAdjustment.toString()}
          onChange={(e) => handleNumberChange('pointAdjustment', e.target.value)}
          error={errors.pointAdjustment}
          helperText="Points to add (positive) or subtract (negative) when condition is met"
          required
        />

        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {mode === 'create' ? 'Add Rule' : 'Update Rule'}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
