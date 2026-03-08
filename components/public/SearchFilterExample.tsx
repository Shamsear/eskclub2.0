'use client';

import { useState, useMemo } from 'react';
import { SearchBar, HighlightedText } from './SearchBar';
import { FilterPanel, FilterConfig } from './FilterPanel';
import { SearchEmptyState, FilterEmptyState } from './EmptyState';
import { applyFilters, getActiveFilterCount } from '@/lib/utils/filterUtils';
import { PublicCard, CardContent } from './PublicCard';

/**
 * Example component demonstrating the search and filtering system
 * This shows how to implement Requirements 12.1-12.5:
 * - Debounced search (12.1)
 * - Text highlighting (12.2)
 * - AND logic for filters (12.3)
 * - Empty states with suggestions (12.4)
 * - Active filter indicators with reset (12.5)
 */

interface ExampleItem {
  id: number;
  name: string;
  category: string;
  status: string;
  count: number;
  description: string;
}

const sampleData: ExampleItem[] = [
  { id: 1, name: 'Tournament Alpha', category: 'sports', status: 'active', count: 25, description: 'A competitive sports tournament' },
  { id: 2, name: 'Tournament Beta', category: 'esports', status: 'upcoming', count: 15, description: 'An exciting esports event' },
  { id: 3, name: 'Championship Gamma', category: 'sports', status: 'completed', count: 30, description: 'Past championship event' },
  { id: 4, name: 'League Delta', category: 'sports', status: 'active', count: 20, description: 'Ongoing league matches' },
  { id: 5, name: 'Cup Epsilon', category: 'esports', status: 'active', count: 10, description: 'Esports cup competition' },
];

export default function SearchFilterExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterConfig>({});

  // Apply filters with AND logic
  const filteredItems = useMemo(() => {
    const filterConfig = {
      ...filters,
      search: searchQuery,
    };
    
    return applyFilters(sampleData, filterConfig, ['name', 'description']);
  }, [filters, searchQuery]);

  const activeFilterCount = getActiveFilterCount(filters);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search & Filter System Demo
        </h1>
        <p className="text-gray-600">
          Demonstrating debounced search, text highlighting, AND filter logic, and empty states
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Search Bar */}
        <div className="lg:col-span-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or description..."
            onClear={handleClearSearch}
          />
        </div>

        {/* Filter Panel */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            filterSections={[
              {
                id: 'category',
                title: 'Category',
                type: 'checkbox',
                options: [
                  { value: 'sports', label: 'Sports', count: 3 },
                  { value: 'esports', label: 'Esports', count: 2 },
                ],
              },
              {
                id: 'status',
                title: 'Status',
                type: 'radio',
                options: [
                  { value: 'active', label: 'Active' },
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'completed', label: 'Completed' },
                ],
              },
              {
                id: 'count',
                title: 'Participant Count',
                type: 'range',
                min: 0,
                max: 50,
              },
            ]}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredItems.length} of {sampleData.length} items
        {(searchQuery || activeFilterCount > 0) && (
          <span className="ml-2 text-primary-600 font-medium">
            (filtered from {sampleData.length} total)
          </span>
        )}
      </div>

      {/* Results Grid */}
      {filteredItems.length === 0 ? (
        searchQuery ? (
          <SearchEmptyState
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
          />
        ) : activeFilterCount > 0 ? (
          <FilterEmptyState
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No items available
            </h3>
            <p className="text-gray-600">
              There are no items to display at the moment.
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <PublicCard key={item.id} hover>
              <CardContent>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  <HighlightedText text={item.name} highlight={searchQuery} />
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  <HighlightedText text={item.description} highlight={searchQuery} />
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {item.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {item.status}
                  </span>
                  <span className="text-gray-600">
                    {item.count} participants
                  </span>
                </div>
              </CardContent>
            </PublicCard>
          ))}
        </div>
      )}

      {/* Implementation Notes */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Implementation Features
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Debounced Search (Req 12.1):</strong> Search input is debounced by 300ms for real-time filtering without excessive re-renders</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Text Highlighting (Req 12.2):</strong> Search matches are highlighted with yellow background using the HighlightedText component</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>AND Filter Logic (Req 12.3):</strong> Multiple filters are combined with AND logic - all conditions must be satisfied</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Empty States (Req 12.4):</strong> Contextual empty states with helpful suggestions for search and filter scenarios</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Active Filters (Req 12.5):</strong> Active filter indicators with individual and bulk reset options</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
