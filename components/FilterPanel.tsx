'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function FilterSection({ title, children, defaultExpanded = false }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all flex items-center justify-between"
        type="button"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export interface FilterConfig {
  search?: string;
  roles?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minMembers?: number;
  maxMembers?: number;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterConfig) => void;
  showRoleFilters?: boolean;
  showMemberCountFilters?: boolean;
  showSortOptions?: boolean;
  availableRoles?: string[];
  sortOptions?: Array<{ value: string; label: string }>;
  className?: string;
}

export function FilterPanel({
  onFilterChange,
  showRoleFilters = true,
  showMemberCountFilters = false,
  showSortOptions = true,
  availableRoles = ['MANAGER', 'MENTOR', 'CAPTAIN', 'PLAYER'],
  sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'joinDate', label: 'Join Date' },
  ],
  className = '',
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    searchParams.get('roles')?.split(',').filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || sortOptions[0]?.value || 'name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc'
  );
  const [minMembers, setMinMembers] = useState(searchParams.get('minMembers') || '');
  const [maxMembers, setMaxMembers] = useState(searchParams.get('maxMembers') || '');

  // Update URL params whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (selectedRoles.length > 0) params.set('roles', selectedRoles.join(','));
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (minMembers) params.set('minMembers', minMembers);
    if (maxMembers) params.set('maxMembers', maxMembers);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Update URL without triggering a navigation
    router.replace(newUrl, { scroll: false });

    // Notify parent component of filter changes
    onFilterChange({
      search,
      roles: selectedRoles,
      sortBy,
      sortOrder,
      minMembers: minMembers ? parseInt(minMembers) : undefined,
      maxMembers: maxMembers ? parseInt(maxMembers) : undefined,
    });
  }, [search, selectedRoles, sortBy, sortOrder, minMembers, maxMembers, pathname, router, onFilterChange]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedRoles([]);
    setSortBy(sortOptions[0]?.value || 'name');
    setSortOrder('asc');
    setMinMembers('');
    setMaxMembers('');
  };

  const hasActiveFilters =
    search ||
    selectedRoles.length > 0 ||
    minMembers ||
    maxMembers ||
    sortBy !== (sortOptions[0]?.value || 'name') ||
    sortOrder !== 'asc';

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      MANAGER: 'bg-blue-100 text-blue-800 border-blue-300',
      MENTOR: 'bg-green-100 text-green-800 border-green-300',
      CAPTAIN: 'bg-purple-100 text-purple-800 border-purple-300',
      PLAYER: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Filters & Search</h3>
              <p className="text-xs text-gray-500">Refine your results</p>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Search Input - Always Visible */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            aria-label="Search"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Expandable Sections */}
        <div className="space-y-2">
          {/* Role Filters */}
          {showRoleFilters && (
            <FilterSection title="Filter by Roles" defaultExpanded={selectedRoles.length > 0}>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleToggle(role)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                      selectedRoles.includes(role)
                        ? getRoleBadgeColor(role) + ' shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    role="checkbox"
                    aria-checked={selectedRoles.includes(role)}
                    aria-label={`Filter by ${role} role`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              {selectedRoles.length > 0 && (
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </FilterSection>
          )}

          {/* Member Count Filters */}
          {showMemberCountFilters && (
            <FilterSection title="Member Count Range" defaultExpanded={!!(minMembers || maxMembers)}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Minimum</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minMembers}
                    onChange={(e) => setMinMembers(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Minimum members"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Maximum</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Maximum members"
                  />
                </div>
              </div>
            </FilterSection>
          )}

          {/* Sort Options */}
          {showSortOptions && sortOptions.length > 0 && (
            <FilterSection title="Sort Options" defaultExpanded={sortBy !== (sortOptions[0]?.value || 'name') || sortOrder !== 'asc'}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    aria-label="Sort by"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Order</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortOrder('asc')}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all ${
                        sortOrder === 'asc'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        Ascending
                      </div>
                    </button>
                    <button
                      onClick={() => setSortOrder('desc')}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all ${
                        sortOrder === 'desc'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                        Descending
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </FilterSection>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-gray-700">Active:</span>
              {search && (
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </span>
              )}
              {selectedRoles.length > 0 && (
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  {selectedRoles.length} Role{selectedRoles.length !== 1 ? 's' : ''}
                </span>
              )}
              {(minMembers || maxMembers) && (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                  {minMembers || '0'}-{maxMembers || '∞'} Members
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
