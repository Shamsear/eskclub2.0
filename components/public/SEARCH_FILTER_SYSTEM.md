# Search and Filtering System

This document describes the search and filtering system implemented for the public sports platform.

## Overview

The search and filtering system provides a comprehensive solution for filtering and searching through data with the following features:

- **Debounced Search**: Real-time search with configurable debouncing to prevent excessive re-renders
- **Text Highlighting**: Automatic highlighting of search matches in results
- **AND Filter Logic**: Multiple filters combined with AND logic (all conditions must be satisfied)
- **Empty States**: Contextual empty states with helpful suggestions
- **Active Filter Indicators**: Visual indicators for active filters with easy reset options

## Components

### SearchBar

A debounced search input component for real-time filtering.

**Props:**
- `value: string` - Current search value
- `onChange: (value: string) => void` - Callback when search value changes (debounced)
- `placeholder?: string` - Placeholder text (default: "Search...")
- `debounceMs?: number` - Debounce delay in milliseconds (default: 300)
- `className?: string` - Additional CSS classes
- `onClear?: () => void` - Callback when clear button is clicked

**Example:**
```tsx
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search tournaments..."
  onClear={() => setSearchQuery('')}
/>
```

### HighlightedText

A component that highlights search matches within text.

**Props:**
- `text: string` - The text to display
- `highlight: string` - The search query to highlight
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<HighlightedText 
  text={tournament.name} 
  highlight={searchQuery} 
/>
```

### FilterPanel

A comprehensive filter panel supporting multiple filter types with AND logic.

**Props:**
- `filters: FilterConfig` - Current filter state
- `onFilterChange: (filters: FilterConfig) => void` - Callback when filters change
- `filterSections?: Array<FilterSection>` - Configuration for filter sections
- `className?: string` - Additional CSS classes

**Filter Section Types:**
- `checkbox` - Multiple selection (array of values)
- `radio` - Single selection (single value)
- `range` - Min/max range (two numeric values)

**Example:**
```tsx
<FilterPanel
  filters={filters}
  onFilterChange={setFilters}
  filterSections={[
    {
      id: 'status',
      title: 'Status',
      type: 'checkbox',
      options: [
        { value: 'active', label: 'Active', count: 10 },
        { value: 'completed', label: 'Completed', count: 5 },
      ],
    },
    {
      id: 'participants',
      title: 'Participants',
      type: 'range',
      min: 0,
      max: 100,
    },
  ]}
/>
```

### EmptyState Components

Contextual empty state components for different scenarios.

**EmptyState** - Generic empty state:
```tsx
<EmptyState
  title="No results found"
  description="Try adjusting your search criteria"
  action={{
    label: 'Clear Filters',
    onClick: handleClearFilters,
  }}
  suggestions={[
    'Check your spelling',
    'Try more general keywords',
  ]}
/>
```

**SearchEmptyState** - Specialized for search results:
```tsx
<SearchEmptyState
  searchQuery={searchQuery}
  onClearSearch={handleClearSearch}
/>
```

**FilterEmptyState** - Specialized for filtered results:
```tsx
<FilterEmptyState
  onClearFilters={handleClearFilters}
  activeFilterCount={activeFilterCount}
/>
```

## Utility Functions

### applyFilters

Apply multiple filters with AND logic to an array of items.

```typescript
import { applyFilters } from '@/lib/utils/filterUtils';

const filteredItems = applyFilters(
  items,
  { status: ['active', 'upcoming'], participants_min: 10 },
  ['name', 'description'] // Search fields
);
```

### getActiveFilterCount

Get the count of active filters (excluding search).

```typescript
import { getActiveFilterCount } from '@/lib/utils/filterUtils';

const count = getActiveFilterCount(filters);
```

## Complete Implementation Example

```tsx
'use client';

import { useState, useMemo } from 'react';
import { SearchBar, HighlightedText } from '@/components/public/SearchBar';
import { FilterPanel, FilterConfig } from '@/components/public/FilterPanel';
import { SearchEmptyState, FilterEmptyState } from '@/components/public/EmptyState';
import { applyFilters, getActiveFilterCount } from '@/lib/utils/filterUtils';

export default function MyListingPage() {
  const [data, setData] = useState<MyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterConfig>({});

  // Apply filters with AND logic
  const filteredData = useMemo(() => {
    const filterConfig = {
      ...filters,
      search: searchQuery,
    };
    
    return applyFilters(data, filterConfig, ['name', 'description']);
  }, [data, filters, searchQuery]);

  const activeFilterCount = getActiveFilterCount(filters);

  const handleClearSearch = () => setSearchQuery('');
  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <div>
      {/* Search and Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
            onClear={handleClearSearch}
          />
        </div>
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            filterSections={[
              // Your filter sections
            ]}
          />
        </div>
      </div>

      {/* Results */}
      {filteredData.length === 0 ? (
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
          <div>No data available</div>
        )
      ) : (
        <div>
          {filteredData.map((item) => (
            <div key={item.id}>
              <HighlightedText text={item.name} highlight={searchQuery} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Requirements Coverage

This implementation satisfies all requirements from the specification:

- **Requirement 12.1**: Real-time filtering with debouncing (300ms default)
- **Requirement 12.2**: Text highlighting for search matches with visual emphasis
- **Requirement 12.3**: AND logic for combining multiple filters
- **Requirement 12.4**: Empty states with helpful suggestions
- **Requirement 12.5**: Active filter indicators with individual and bulk reset options

## Accessibility

All components follow accessibility best practices:

- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Semantic HTML structure

## Performance

The system is optimized for performance:

- Debounced search input to prevent excessive re-renders
- Memoized filter results using `useMemo`
- Efficient filter algorithms with early returns
- Client-side filtering for small to medium datasets
- Server-side filtering recommended for large datasets (>1000 items)

## Customization

All components accept `className` props for custom styling and can be easily themed using Tailwind CSS utility classes.
