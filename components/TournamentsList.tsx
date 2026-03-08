'use client';

import { useState, useMemo } from 'react';
import { TournamentCard } from './TournamentCard';
import { TournamentFilters, TournamentStatus } from './TournamentFilters';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import Link from 'next/link';

interface Tournament {
  id: number;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  _count: {
    participants: number;
    matches: number;
  };
}

interface TournamentsListProps {
  initialTournaments: Tournament[];
}

export function TournamentsList({ initialTournaments }: TournamentsListProps) {
  const [tournaments] = useState<Tournament[]>(initialTournaments);
  const [filters, setFilters] = useState<{
    status: TournamentStatus;
    startDate: string;
    endDate: string;
  }>({
    status: 'all',
    startDate: '',
    endDate: '',
  });

  // Helper function to determine tournament status
  const getTournamentStatus = (tournament: Tournament): 'upcoming' | 'ongoing' | 'completed' => {
    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const endDate = tournament.endDate ? new Date(tournament.endDate) : null;

    if (startDate > now) {
      return 'upcoming';
    } else if (endDate && endDate < now) {
      return 'completed';
    } else {
      return 'ongoing';
    }
  };

  // Filter tournaments based on current filters
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      // Status filter
      if (filters.status !== 'all') {
        const tournamentStatus = getTournamentStatus(tournament);
        if (tournamentStatus !== filters.status) {
          return false;
        }
      }

      // Date range filter
      if (filters.startDate) {
        const filterStartDate = new Date(filters.startDate);
        const tournamentStartDate = new Date(tournament.startDate);
        if (tournamentStartDate < filterStartDate) {
          return false;
        }
      }

      if (filters.endDate) {
        const filterEndDate = new Date(filters.endDate);
        const tournamentStartDate = new Date(tournament.startDate);
        // Check if tournament starts before or on the filter end date
        if (tournamentStartDate > filterEndDate) {
          return false;
        }
      }

      return true;
    });
  }, [tournaments, filters]);

  // Show empty state if no tournaments exist at all
  if (tournaments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tournaments yet
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first tournament to organize matches and track results
          </p>
          <Link href="/dashboard/tournaments/new">
            <button className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Tournament
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <TournamentFilters onFilterChange={setFilters} />
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredTournaments.length}</span> of <span className="font-medium text-gray-900">{tournaments.length}</span> tournaments
        </p>
      </div>
      
      {filteredTournaments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tournaments found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters to see more results
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </>
  );
}
