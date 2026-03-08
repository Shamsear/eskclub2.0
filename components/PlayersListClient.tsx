'use client';

import { useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { FilterPanel, FilterConfig } from './FilterPanel';
import { Pagination } from './ui/Pagination';
import { OptimizedImage } from './ui/OptimizedImage';

interface PlayerRole {
  id: number;
  role: string;
}

interface Player {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  place?: string | null;
  dateOfBirth?: string | null;
  photo?: string | null;
  createdAt: string;
  updatedAt: string;
  roles: PlayerRole[];
}

interface PlayersListClientProps {
  players: Player[];
  clubId: string;
}

export function PlayersListClient({ players, clubId }: PlayersListClientProps) {
  const [filters, setFilters] = useState<FilterConfig>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const handleFilterChange = useCallback((newFilters: FilterConfig) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Filter, sort, and paginate players
  const { paginatedPlayers, totalPages, totalFiltered } = useMemo(() => {
    let filtered = [...players];

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(search) ||
          player.email.toLowerCase().includes(search) ||
          player.place?.toLowerCase().includes(search)
      );
    }

    // Apply role filter - support multiple roles
    if (filters.roles && filters.roles.length > 0) {
      filtered = filtered.filter((player) =>
        filters.roles!.some((role) =>
          player.roles.some((r) => r.role === role)
        )
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'email':
            comparison = a.email.localeCompare(b.email);
            break;
          case 'joinDate':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          default:
            comparison = a.name.localeCompare(b.name);
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Calculate pagination
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPlayers = filtered.slice(startIndex, endIndex);

    return { paginatedPlayers, totalPages, totalFiltered };
  }, [players, filters, currentPage, pageSize]);

  const getRoleBadges = (roles: PlayerRole[]) => {
    const roleColors: Record<string, string> = {
      MANAGER: 'bg-blue-100 text-blue-800',
      MENTOR: 'bg-green-100 text-green-800',
      CAPTAIN: 'bg-purple-100 text-purple-800',
      PLAYER: 'bg-orange-100 text-orange-800',
    };

    return roles.map((role) => (
      <span
        key={role.id}
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          roleColors[role.role] || 'bg-gray-100 text-gray-800'
        }`}
        role="status"
        aria-label={`Role: ${role.role}`}
      >
        {role.role}
      </span>
    ));
  };

  return (
    <div>
      {/* Filters */}
      <FilterPanel
        onFilterChange={handleFilterChange}
        showRoleFilters={true}
        showMemberCountFilters={false}
        showSortOptions={true}
        availableRoles={['MANAGER', 'MENTOR', 'CAPTAIN', 'PLAYER']}
        sortOptions={[
          { value: 'name', label: 'Name' },
          { value: 'email', label: 'Email' },
          { value: 'joinDate', label: 'Join Date' },
        ]}
        className="mb-6"
      />

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600" role="status" aria-live="polite">
        Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalFiltered)} of {totalFiltered} filtered players ({players.length} total)
      </div>

      {/* Players List */}
      {paginatedPlayers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {players.length === 0 ? 'No players yet' : 'No players match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {players.length === 0
                ? 'Get started by adding a player to this club.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {players.length === 0 && (
              <Link href={`/dashboard/clubs/${clubId}/players/new`}>
                <Button variant="primary">Add First Player</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4" role="list" aria-label="Players list">
            {paginatedPlayers.map((player) => (
              <Card key={player.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4 flex-1">
                    {player.photo ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <OptimizedImage
                          src={player.photo}
                          alt={`${player.name}'s profile photo`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0"
                        aria-label={`${player.name}'s avatar`}
                      >
                        <span className="text-2xl font-semibold text-orange-600" aria-hidden="true">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {player.name}
                      </h3>
                      <p className="text-gray-600 truncate">
                        <a href={`mailto:${player.email}`} className="hover:underline">
                          {player.email}
                        </a>
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2" aria-label="Player roles">
                        {getRoleBadges(player.roles)}
                      </div>
                      {player.phone && (
                        <p className="text-sm text-gray-500 mt-1">
                          <a href={`tel:${player.phone}`} className="hover:underline">
                            {player.phone}
                          </a>
                        </p>
                      )}
                      {player.place && (
                        <p className="text-sm text-gray-500">{player.place}</p>
                      )}
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/clubs/${clubId}/players/${player.id}`}
                    aria-label={`View ${player.name}'s profile`}
                  >
                    <Button variant="outline">View Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          )}
        </>
      )}
    </div>
  );
}
