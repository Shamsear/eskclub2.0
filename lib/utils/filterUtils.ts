/**
 * Utility functions for search and filtering
 * Implements Requirements 12.1, 12.3 (real-time filtering with AND logic)
 */

export interface FilterConfig {
  [key: string]: string | string[] | number | boolean | undefined;
}

/**
 * Apply multiple filters with AND logic
 * All filter conditions must be satisfied for an item to pass
 */
export function applyFilters<T extends Record<string, any>>(
  items: T[],
  filters: FilterConfig,
  searchFields: (keyof T)[] = []
): T[] {
  return items.filter((item) => {
    // Check each filter condition
    for (const [key, value] of Object.entries(filters)) {
      // Skip undefined or empty values
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        continue;
      }

      // Handle search query (special case)
      if (key === 'search' && typeof value === 'string') {
        const searchLower = value.toLowerCase();
        const matchesSearch = searchFields.some((field) => {
          const fieldValue = item[field];
          if (fieldValue === null || fieldValue === undefined) return false;
          return String(fieldValue).toLowerCase().includes(searchLower);
        });
        if (!matchesSearch) return false;
        continue;
      }

      // Handle array filters (checkbox - item must match at least one value)
      if (Array.isArray(value)) {
        const itemValue = item[key];
        if (Array.isArray(itemValue)) {
          // Item has array value - check if any filter value is in item array
          const hasMatch = value.some((v) => itemValue.includes(v));
          if (!hasMatch) return false;
        } else {
          // Item has single value - check if it matches any filter value
          if (!value.includes(itemValue)) return false;
        }
        continue;
      }

      // Handle range filters
      if (key.endsWith('_min')) {
        const baseKey = key.replace('_min', '');
        const itemValue = Number(item[baseKey]);
        if (isNaN(itemValue) || itemValue < Number(value)) return false;
        continue;
      }

      if (key.endsWith('_max')) {
        const baseKey = key.replace('_max', '');
        const itemValue = Number(item[baseKey]);
        if (isNaN(itemValue) || itemValue > Number(value)) return false;
        continue;
      }

      // Handle exact match filters (radio, select)
      if (item[key] !== value) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Search items by query across multiple fields
 */
export function searchItems<T extends Record<string, any>>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] {
  if (!query.trim()) return items;

  const searchLower = query.toLowerCase();
  return items.filter((item) =>
    searchFields.some((field) => {
      const fieldValue = item[field];
      if (fieldValue === null || fieldValue === undefined) return false;
      return String(fieldValue).toLowerCase().includes(searchLower);
    })
  );
}

/**
 * Sort items by field and order
 */
export function sortItems<T extends Record<string, any>>(
  items: T[],
  sortBy: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    // Handle null/undefined
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle strings
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();
    
    if (sortOrder === 'asc') {
      return aString.localeCompare(bString);
    } else {
      return bString.localeCompare(aString);
    }
  });
}

/**
 * Get active filter count
 */
export function getActiveFilterCount(filters: FilterConfig): number {
  return Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false; // Don't count search as a filter
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  }).length;
}

/**
 * Highlight text matches in a string
 */
export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;

  // Escape special regex characters
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900 font-medium px-0.5 rounded">$1</mark>');
}
