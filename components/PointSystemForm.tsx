'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ErrorMessage } from './FormError';
import { useToast } from './ui/Toast';
import { ConditionalRule, RuleConditionType, ComparisonOperator } from './ConditionalRuleModal';
import { Select } from './ui/Select';
import { ConditionalRulesList } from './ConditionalRulesList';


// Validation schema
const pointSystemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().optional(),
  pointsPerWin: z.number().int("Must be an integer"),
  pointsPerDraw: z.number().int("Must be an integer"),
  pointsPerLoss: z.number().int("Must be an integer"),
  pointsPerGoalScored: z.number().int("Must be an integer"),
  pointsPerGoalConceded: z.number().int("Must be an integer"),
  pointsForWalkoverWin: z.number().int("Must be an integer"),
  pointsForWalkoverLoss: z.number().int("Must be an integer"),
  pointsPerStageWin: z.number().int("Must be an integer"),
  pointsPerStageDraw: z.number().int("Must be an integer"),
  pointsPerCleanSheet: z.number().int("Must be an integer"),
});

interface PointSystemFormProps {
  initialData?: {
    id?: number;
    name: string;
    description?: string | null;
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    pointsPerGoalScored: number;
    pointsPerGoalConceded: number;
    pointsForWalkoverWin?: number;
    pointsForWalkoverLoss?: number;
    pointsPerStageWin?: number;
    pointsPerStageDraw?: number;
    pointsPerCleanSheet?: number;
    conditionalRules?: ConditionalRule[];
  };
  mode: 'create' | 'edit';
}

interface FormErrors {
  name?: string;
  description?: string;
  pointsPerWin?: string;
  pointsPerDraw?: string;
  pointsPerLoss?: string;
  pointsPerGoalScored?: string;
  pointsPerGoalConceded?: string;
  pointsForWalkoverWin?: string;
  pointsForWalkoverLoss?: string;
  pointsPerStageWin?: string;
  pointsPerStageDraw?: string;
  pointsPerCleanSheet?: string;
  submit?: string;
}

export function PointSystemForm({ initialData, mode }: PointSystemFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    pointsPerWin: initialData?.pointsPerWin ?? 3,
    pointsPerDraw: initialData?.pointsPerDraw ?? 1,
    pointsPerLoss: initialData?.pointsPerLoss ?? 0,
    pointsPerGoalScored: initialData?.pointsPerGoalScored ?? 0,
    pointsPerGoalConceded: initialData?.pointsPerGoalConceded ?? 0,
    pointsForWalkoverWin: initialData?.pointsForWalkoverWin ?? 3,
    pointsForWalkoverLoss: initialData?.pointsForWalkoverLoss ?? -3,
    pointsPerStageWin: initialData?.pointsPerStageWin ?? 0,
    pointsPerStageDraw: initialData?.pointsPerStageDraw ?? 0,
    pointsPerCleanSheet: initialData?.pointsPerCleanSheet ?? 0,
  });

  // Conditional rules state
  const [conditionalRules, setConditionalRules] = useState<ConditionalRule[]>(
    initialData?.conditionalRules || []
  );
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [ruleFormData, setRuleFormData] = useState<ConditionalRule>({
    conditionType: RuleConditionType.GOALS_SCORED_THRESHOLD,
    operator: ComparisonOperator.GREATER_THAN,
    threshold: 0,
    pointAdjustment: 0,
  });
  const [ruleErrors, setRuleErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    try {
      pointSystemSchema.parse(formData);
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
      const url = mode === 'create' 
        ? '/api/point-systems'
        : `/api/point-systems/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const payload: any = {
        name: formData.name,
        description: formData.description || null,
        pointsPerWin: formData.pointsPerWin,
        pointsPerDraw: formData.pointsPerDraw,
        pointsPerLoss: formData.pointsPerLoss,
        pointsPerGoalScored: formData.pointsPerGoalScored,
        pointsPerGoalConceded: formData.pointsPerGoalConceded,
        pointsForWalkoverWin: formData.pointsForWalkoverWin,
        pointsForWalkoverLoss: formData.pointsForWalkoverLoss,
        pointsPerStageWin: formData.pointsPerStageWin,
        pointsPerStageDraw: formData.pointsPerStageDraw,
        pointsPerCleanSheet: formData.pointsPerCleanSheet,
      };

      // Include conditional rules for create mode
      if (mode === 'create' && conditionalRules.length > 0) {
        payload.conditionalRules = conditionalRules.map(rule => ({
          conditionType: rule.conditionType,
          operator: rule.operator,
          threshold: rule.threshold,
          pointAdjustment: rule.pointAdjustment,
        }));
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          setErrors(data.details);
        } else {
          setErrors({ submit: data.error || 'An error occurred' });
        }
        showToast(data.error || 'Failed to save template', 'error');
        return;
      }

      // Success
      showToast(
        mode === 'create' ? 'Template created successfully' : 'Template updated successfully',
        'success'
      );
      
      router.push('/dashboard/point-systems');
      router.refresh();
    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
      showToast(errorMessage, 'error');
      console.error('Point system form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/point-systems');
  };

  const handleNumberChange = (field: keyof typeof formData, value: string) => {
    // Allow empty string or valid integers (including negative)
    if (value === '' || value === '-') {
      setFormData({ ...formData, [field]: 0 });
      return;
    }
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setFormData({ ...formData, [field]: numValue });
      // Clear error for this field when user makes changes
      if (errors[field as keyof FormErrors]) {
        setErrors({ ...errors, [field]: undefined });
      }
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user makes changes
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  // Conditional rule handlers
  const handleAddRule = () => {
    setRuleFormData({
      conditionType: RuleConditionType.GOALS_SCORED_THRESHOLD,
      operator: ComparisonOperator.GREATER_THAN,
      threshold: 0,
      pointAdjustment: 0,
    });
    setEditingRuleIndex(null);
    setRuleErrors({});
    setShowRuleForm(true);
  };

  const handleEditRule = (index: number) => {
    setRuleFormData(conditionalRules[index]);
    setEditingRuleIndex(index);
    setRuleErrors({});
    setShowRuleForm(true);
  };

  const handleDeleteRule = (index: number) => {
    setConditionalRules(conditionalRules.filter((_, i) => i !== index));
    showToast('Rule removed', 'success');
  };

  const handleCancelRule = () => {
    setShowRuleForm(false);
    setEditingRuleIndex(null);
    setRuleErrors({});
  };

  const handleSaveRule = () => {
    // Simple validation
    if (ruleFormData.threshold < 0) {
      setRuleErrors({ threshold: 'Threshold must be non-negative' });
      return;
    }

    if (editingRuleIndex !== null) {
      // Update existing rule
      const updated = [...conditionalRules];
      updated[editingRuleIndex] = { ...ruleFormData, id: conditionalRules[editingRuleIndex].id || Date.now() };
      setConditionalRules(updated);
      showToast('Rule updated', 'success');
    } else {
      // Add new rule
      setConditionalRules([...conditionalRules, { ...ruleFormData, id: Date.now() }]);
      showToast('Rule added', 'success');
    }
    setShowRuleForm(false);
    setEditingRuleIndex(null);
    setRuleErrors({});
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label={`${mode === 'create' ? 'Create' : 'Edit'} point system template form`}>
      <Input
        label="Template Name"
        type="text"
        value={formData.name}
        onChange={(e) => handleFieldChange('name', e.target.value)}
        error={errors.name}
        placeholder="e.g., Standard League Points"
        required
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
          rows={3}
          placeholder="Optional description of this point system"
          aria-describedby={errors.description ? "description-error" : undefined}
          aria-invalid={errors.description ? "true" : "false"}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">{errors.description}</p>
        )}
      </div>

      <fieldset className="border-t pt-6">
        <legend className="text-lg font-medium text-gray-900 mb-2">Base Point Configuration</legend>
        <p className="text-sm text-gray-600 mb-4">
          Configure how points are awarded for match outcomes and goals. You can use positive, negative, or zero values.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Points Per Win"
            type="number"
            value={formData.pointsPerWin.toString()}
            onChange={(e) => handleNumberChange('pointsPerWin', e.target.value)}
            error={errors.pointsPerWin}
            helperText="Points awarded for winning"
            required
          />

          <Input
            label="Points Per Draw"
            type="number"
            value={formData.pointsPerDraw.toString()}
            onChange={(e) => handleNumberChange('pointsPerDraw', e.target.value)}
            error={errors.pointsPerDraw}
            helperText="Points awarded for drawing"
            required
          />

          <Input
            label="Points Per Loss"
            type="number"
            value={formData.pointsPerLoss.toString()}
            onChange={(e) => handleNumberChange('pointsPerLoss', e.target.value)}
            error={errors.pointsPerLoss}
            helperText="Points awarded for losing"
            required
          />

          <Input
            label="Points Per Goal Scored"
            type="number"
            value={formData.pointsPerGoalScored.toString()}
            onChange={(e) => handleNumberChange('pointsPerGoalScored', e.target.value)}
            error={errors.pointsPerGoalScored}
            helperText="Points per goal scored"
            required
          />

          <Input
            label="Points Per Goal Conceded"
            type="number"
            value={formData.pointsPerGoalConceded.toString()}
            onChange={(e) => handleNumberChange('pointsPerGoalConceded', e.target.value)}
            error={errors.pointsPerGoalConceded}
            helperText="Points per goal conceded (often negative)"
            required
          />
        </div>
      </fieldset>

      <fieldset className="border-t pt-6">
        <legend className="text-lg font-medium text-gray-900 mb-2">Additional Point Configurations</legend>
        <p className="text-sm text-gray-600 mb-4">
          Configure special point awards for walkovers, boots, stages, and clean sheets
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Points for Walkover Win"
            type="number"
            value={formData.pointsForWalkoverWin.toString()}
            onChange={(e) => handleNumberChange('pointsForWalkoverWin', e.target.value)}
            error={errors.pointsForWalkoverWin}
            helperText="Points for team that receives walkover"
            required
          />

          <Input
            label="Points for Walkover Loss"
            type="number"
            value={formData.pointsForWalkoverLoss.toString()}
            onChange={(e) => handleNumberChange('pointsForWalkoverLoss', e.target.value)}
            error={errors.pointsForWalkoverLoss}
            helperText="Penalty for team that gives walkover (usually negative)"
            required
          />

          <Input
            label="Points Per Stage Win"
            type="number"
            value={formData.pointsPerStageWin.toString()}
            onChange={(e) => handleNumberChange('pointsPerStageWin', e.target.value)}
            error={errors.pointsPerStageWin}
            helperText="Points for winning a stage/round"
            required
          />

          <Input
            label="Points Per Stage Draw"
            type="number"
            value={formData.pointsPerStageDraw.toString()}
            onChange={(e) => handleNumberChange('pointsPerStageDraw', e.target.value)}
            error={errors.pointsPerStageDraw}
            helperText="Points for drawing a stage/round"
            required
          />

          <Input
            label="Points Per Clean Sheet"
            type="number"
            value={formData.pointsPerCleanSheet.toString()}
            onChange={(e) => handleNumberChange('pointsPerCleanSheet', e.target.value)}
            error={errors.pointsPerCleanSheet}
            helperText="Points for not conceding goals"
            required
          />
        </div>
      </fieldset>

      <fieldset className="border-t pt-6">
        <legend className="text-lg font-medium text-gray-900 mb-2">Conditional Rules (Optional)</legend>
        <p className="text-sm text-gray-600 mb-4">
          Add custom rules to award or deduct points based on specific match conditions.
          {mode === 'create' && (
            <span className="block mt-1 text-blue-600">
              Rules will be saved when you create the template.
            </span>
          )}
        </p>
        
        <ConditionalRulesList
          rules={conditionalRules}
          onEdit={handleEditRule}
          onDelete={handleDeleteRule}
        />

        {/* Inline Expandable Rule Form */}
        {showRuleForm && (
          <div className="mt-4 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              {editingRuleIndex !== null ? 'Edit Rule' : 'Add New Rule'}
            </h4>
            
            <div className="space-y-4">
              <Select
                label="Condition Type"
                value={ruleFormData.conditionType}
                onChange={(e) => setRuleFormData({ ...ruleFormData, conditionType: e.target.value as RuleConditionType })}
                options={[
                  { value: RuleConditionType.GOALS_SCORED_THRESHOLD, label: 'Goals Scored Threshold' },
                  { value: RuleConditionType.GOALS_CONCEDED_THRESHOLD, label: 'Goals Conceded Threshold' },
                  { value: RuleConditionType.GOAL_DIFFERENCE_THRESHOLD, label: 'Goal Difference Threshold' },
                  { value: RuleConditionType.CLEAN_SHEET, label: 'Clean Sheet' },
                ]}
              />

              <Select
                label="Comparison Operator"
                value={ruleFormData.operator}
                onChange={(e) => setRuleFormData({ ...ruleFormData, operator: e.target.value as ComparisonOperator })}
                disabled={ruleFormData.conditionType === RuleConditionType.CLEAN_SHEET}
                options={[
                  { value: ComparisonOperator.EQUALS, label: 'Equals (=)' },
                  { value: ComparisonOperator.GREATER_THAN, label: 'Greater Than (>)' },
                  { value: ComparisonOperator.LESS_THAN, label: 'Less Than (<)' },
                  { value: ComparisonOperator.GREATER_THAN_OR_EQUAL, label: 'Greater Than or Equal (≥)' },
                  { value: ComparisonOperator.LESS_THAN_OR_EQUAL, label: 'Less Than or Equal (≤)' },
                ]}
                helperText={ruleFormData.conditionType === RuleConditionType.CLEAN_SHEET ? 'Clean sheet always uses EQUALS' : undefined}
              />

              <Input
                label="Threshold Value"
                type="number"
                value={ruleFormData.threshold.toString()}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  setRuleFormData({ ...ruleFormData, threshold: isNaN(val) ? 0 : val });
                  if (ruleErrors.threshold) setRuleErrors({ ...ruleErrors, threshold: '' });
                }}
                error={ruleErrors.threshold}
                disabled={ruleFormData.conditionType === RuleConditionType.CLEAN_SHEET}
                helperText={ruleFormData.conditionType === RuleConditionType.CLEAN_SHEET ? 'Clean sheet always uses 0' : 'The value to compare against'}
              />

              <Input
                label="Point Adjustment"
                type="number"
                value={ruleFormData.pointAdjustment.toString()}
                onChange={(e) => {
                  const val = e.target.value === '' || e.target.value === '-' ? 0 : parseInt(e.target.value, 10);
                  setRuleFormData({ ...ruleFormData, pointAdjustment: isNaN(val) ? 0 : val });
                }}
                helperText="Points to add (positive) or subtract (negative) when condition is met"
              />

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveRule}
                >
                  {editingRuleIndex !== null ? 'Update Rule' : 'Add Rule'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelRule}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {!showRuleForm && (
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddRule}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
              Add Rule
            </Button>
          </div>
        )}
      </fieldset>

      {errors.submit && (
        <ErrorMessage
          title="Submission Error"
          message={errors.submit}
          onDismiss={() => setErrors({ ...errors, submit: undefined })}
        />
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {mode === 'create' ? 'Create Template' : 'Update Template'}
        </Button>
      </div>


    </form>
  );
}
