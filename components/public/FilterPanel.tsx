'use client';

import { useState, ReactNode } from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

function FilterSection({ title, children, defaultExpanded = true }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const sectionId = `filter-section-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="border-b border-[#1A1A1A] last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors focus:outline-none"
        type="button"
        aria-expanded={isExpanded}
        aria-controls={sectionId}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} filters`}
      >
        <span className="text-sm font-black text-white">{title}</span>
        <svg
          className={`w-4 h-4 text-[#555] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div id={sectionId} className="px-4 pb-4" role="group" aria-labelledby={`${sectionId}-label`}>
          <span id={`${sectionId}-label`} className="sr-only">{title} filter options</span>
          {children}
        </div>
      )}
    </div>
  );
}

export interface FilterConfig {
  [key: string]: string | string[] | number | boolean | undefined;
}

interface FilterPanelProps {
  filters: FilterConfig;
  onFilterChange: (filters: FilterConfig) => void;
  filterSections?: Array<{
    id: string;
    title: string;
    type: 'checkbox' | 'radio' | 'range';
    options?: FilterOption[];
    min?: number;
    max?: number;
  }>;
  className?: string;
}

/**
 * FilterPanel component for multiple filters with AND logic
 * Implements Requirements 12.3 (AND logic for combining filters)
 * Implements Requirements 12.5 (active filter indicators with reset options)
 */
export function FilterPanel({
  filters,
  onFilterChange,
  filterSections = [],
  className = '',
}: FilterPanelProps) {
  const handleCheckboxChange = (sectionId: string, value: string) => {
    const currentValues = (filters[sectionId] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onFilterChange({
      ...filters,
      [sectionId]: newValues.length > 0 ? newValues : undefined,
    });
  };

  const handleRadioChange = (sectionId: string, value: string) => {
    onFilterChange({
      ...filters,
      [sectionId]: value,
    });
  };

  const handleRangeChange = (sectionId: string, field: 'min' | 'max', value: string) => {
    const rangeKey = `${sectionId}_${field}`;
    onFilterChange({
      ...filters,
      [rangeKey]: value ? parseInt(value) : undefined,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter((key) => {
      const value = filters[key];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== '';
    }).length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`overflow-hidden ${className}`} role="region" aria-label="Filter panel">

      {/* Filter Sections */}
      <div>
        {filterSections.map((section) => (
          <FilterSection key={section.id} title={section.title}>
            {section.type === 'checkbox' && section.options && (
              <div className="space-y-0.5">
                {section.options.map((option) => {
                  const isChecked = ((filters[section.id] as string[]) || []).includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.04] px-2 py-2 rounded-lg transition-colors"
                    >
                      {/* Custom checkbox */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(section.id, option.value)}
                        className="sr-only"
                      />
                      <span className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all ${
                        isChecked
                          ? 'border-[#FF6600] bg-[#FF6600]'
                          : 'border-[#333] bg-[#0D0D0D]'
                      }`}>
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm text-[#A0A0A0] flex-1">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-[#444]">({option.count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {section.type === 'radio' && section.options && (
              <div className="space-y-0.5">
                {section.options.map((option) => {
                  const isChecked = filters[section.id] === option.value;
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.04] px-2 py-2 rounded-lg transition-colors"
                    >
                      {/* Custom radio */}
                      <input
                        type="radio"
                        checked={isChecked}
                        onChange={() => handleRadioChange(section.id, option.value)}
                        className="sr-only"
                      />
                      <span className={`w-4 h-4 rounded-full flex-shrink-0 border flex items-center justify-center transition-all ${
                        isChecked
                          ? 'border-[#FF6600] bg-[#FF6600]/10'
                          : 'border-[#333] bg-[#0D0D0D]'
                      }`}>
                        {isChecked && (
                          <span className="w-2 h-2 rounded-full bg-[#FF6600]" />
                        )}
                      </span>
                      <span className="text-sm text-[#A0A0A0] flex-1">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-[#444]">({option.count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {section.type === 'range' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-1">
                    Min {section.min !== undefined && `(${section.min})`}
                  </label>
                  <input
                    type="number"
                    placeholder={section.min?.toString() || '0'}
                    value={(filters[`${section.id}_min`] as number) || ''}
                    onChange={(e) => handleRangeChange(section.id, 'min', e.target.value)}
                    min={section.min} max={section.max}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white border border-[#1E1E1E] focus:outline-none focus:border-[#FF6600]/40 transition-colors"
                    style={{ background: '#0D0D0D' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-1">
                    Max {section.max !== undefined && `(${section.max})`}
                  </label>
                  <input
                    type="number"
                    placeholder={section.max?.toString() || '∞'}
                    value={(filters[`${section.id}_max`] as number) || ''}
                    onChange={(e) => handleRangeChange(section.id, 'max', e.target.value)}
                    min={section.min} max={section.max}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white border border-[#1E1E1E] focus:outline-none focus:border-[#FF6600]/40 transition-colors"
                    style={{ background: '#0D0D0D' }}
                  />
                </div>
              </div>
            )}
          </FilterSection>
        ))}
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-3 border-t border-[#1A1A1A]">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              const section = filterSections.find((s) => s.id === key || key.startsWith(`${s.id}_`));
              if (!section) return null;

              if (Array.isArray(value)) {
                return value.map((v) => {
                  const option = section.options?.find((o) => o.value === v);
                  return (
                    <span key={`${key}-${v}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#FF6600] border border-[#FF6600]/30"
                      style={{ background: 'rgba(255,102,0,0.1)' }}>
                      {option?.label || v}
                      <button onClick={() => handleCheckboxChange(key, v)} aria-label={`Remove ${option?.label || v} filter`}
                        className="hover:text-[#FFB700] transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                });
              }

              if (key.includes('_min') || key.includes('_max')) {
                const baseKey = key.replace(/_min|_max/, '');
                const minValue = filters[`${baseKey}_min`];
                const maxValue = filters[`${baseKey}_max`];
                if (key.endsWith('_min') && (minValue || maxValue)) {
                  return (
                    <span key={baseKey}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#FFB700] border border-[#FFB700]/30"
                      style={{ background: 'rgba(255,183,0,0.08)' }}>
                      {section.title}: {minValue || '0'} – {maxValue || '∞'}
                      <button onClick={() => onFilterChange({ ...filters, [`${baseKey}_min`]: undefined, [`${baseKey}_max`]: undefined })}
                        aria-label={`Remove ${section.title} range filter`} className="hover:text-white transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                }
                return null;
              }

              const option = section.options?.find((o) => o.value === value);
              return (
                <span key={key}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#FF6600] border border-[#FF6600]/30"
                  style={{ background: 'rgba(255,102,0,0.1)' }}>
                  {option?.label || value}
                  <button onClick={() => handleRadioChange(key, '')} aria-label={`Remove ${option?.label || value} filter`}
                    className="hover:text-[#FFB700] transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
