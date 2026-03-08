'use client';

import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export type TournamentStatus = 'all' | 'upcoming' | 'ongoing' | 'completed';

interface TournamentFiltersProps {
  onFilterChange: (filters: {
    status: TournamentStatus;
    startDate: string;
    endDate: string;
  }) => void;
}

export function TournamentFilters({ onFilterChange }: TournamentFiltersProps) {
  const [status, setStatus] = useState<TournamentStatus>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStatusChange = (newStatus: TournamentStatus) => {
    setStatus(newStatus);
    onFilterChange({ status: newStatus, startDate, endDate });
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    onFilterChange({ status, startDate: date, endDate });
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    onFilterChange({ status, startDate, endDate: date });
  };

  const handleClearFilters = () => {
    setStatus('all');
    setStartDate('');
    setEndDate('');
    onFilterChange({ status: 'all', startDate: '', endDate: '' });
  };

  const hasActiveFilters = status !== 'all' || startDate !== '' || endDate !== '';

  return (
    <Card className="mb-6">
      <div className="p-4">
        <fieldset className="flex flex-col lg:flex-row gap-4">
          <legend className="sr-only">Tournament filters</legend>
          {/* Status Filter */}
          <div className="flex-1">
            <label id="status-filter-label" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="status-filter-label">
              <button
                onClick={() => handleStatusChange('all')}
                className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  status === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={status === 'all'}
                aria-label="Show all tournaments"
              >
                All
              </button>
              <button
                onClick={() => handleStatusChange('upcoming')}
                className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  status === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={status === 'upcoming'}
                aria-label="Show upcoming tournaments"
              >
                Upcoming
              </button>
              <button
                onClick={() => handleStatusChange('ongoing')}
                className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  status === 'ongoing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={status === 'ongoing'}
                aria-label="Show ongoing tournaments"
              >
                Ongoing
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  status === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={status === 'completed'}
                aria-label="Show completed tournaments"
              >
                Completed
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex-1">
            <label id="date-range-label" className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex flex-col sm:flex-row gap-2" role="group" aria-labelledby="date-range-label">
              <div className="flex-1">
                <label htmlFor="filter-start-date" className="sr-only">Start date</label>
                <input
                  id="filter-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start date"
                  aria-label="Filter start date"
                />
              </div>
              <div className="flex items-center justify-center text-gray-500 hidden sm:block" aria-hidden="true">
                to
              </div>
              <div className="flex-1">
                <label htmlFor="filter-end-date" className="sr-only">End date</label>
                <input
                  id="filter-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End date"
                  aria-label="Filter end date"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={handleClearFilters}
                className="w-full lg:w-auto"
                aria-label="Clear all filters"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </fieldset>
      </div>
    </Card>
  );
}
