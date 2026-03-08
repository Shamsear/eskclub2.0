'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  suggestions?: string[];
  className?: string;
}

/**
 * EmptyState component with suggestions when no results
 * Implements Requirements 12.4 (empty state with suggestions when no results)
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  suggestions,
  className = '',
}: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className="w-16 h-16 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center ${className}`}>
      <div className="flex justify-center mb-4">
        {icon || defaultIcon}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {suggestions && suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Try these suggestions:
          </p>
          <ul className="space-y-2 text-sm text-gray-600 max-w-md mx-auto">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="text-left">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface SearchEmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
  suggestions?: string[];
  className?: string;
}

/**
 * SearchEmptyState - specialized empty state for search results
 */
export function SearchEmptyState({
  searchQuery,
  onClearSearch,
  suggestions = [
    'Check your spelling',
    'Try more general keywords',
    'Use fewer filters',
    'Browse all items instead',
  ],
  className = '',
}: SearchEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No results found"
      description={`We couldn't find any results for "${searchQuery}"`}
      action={{
        label: 'Clear Search',
        onClick: onClearSearch,
      }}
      suggestions={suggestions}
      className={className}
    />
  );
}

interface FilterEmptyStateProps {
  onClearFilters: () => void;
  activeFilterCount: number;
  className?: string;
}

/**
 * FilterEmptyState - specialized empty state for filtered results
 */
export function FilterEmptyState({
  onClearFilters,
  activeFilterCount,
  className = '',
}: FilterEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      }
      title="No matches found"
      description={`No items match your current filters (${activeFilterCount} active)`}
      action={{
        label: 'Clear All Filters',
        onClick: onClearFilters,
      }}
      suggestions={[
        'Remove some filters to see more results',
        'Try different filter combinations',
        'Browse all items without filters',
      ]}
      className={className}
    />
  );
}
