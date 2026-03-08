'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/dialog';
import { FilterPanel, FilterConfig } from './FilterPanel';
import { ClubCardSkeleton } from './ui/LoadingSkeleton';
import { OptimizedImage } from './ui/OptimizedImage';
import { Pagination } from './ui/Pagination';

interface Club {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    players: number;
  };
  counts?: {
    managers: number;
    mentors: number;
    captains: number;
    players: number;
  };
}

export function ClubsList() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterConfig>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; clubId: number | null; clubName: string }>({
    isOpen: false,
    clubId: null,
    clubName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterConfig) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Filter, sort, and paginate clubs based on active filters
  const { paginatedClubs, totalPages, totalFiltered } = useMemo(() => {
    let filtered = [...clubs];

    // Apply search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (club) =>
          club.name.toLowerCase().includes(query) ||
          club.description?.toLowerCase().includes(query)
      );
    }

    // Apply member count filters
    if (filters.minMembers !== undefined) {
      filtered = filtered.filter(
        (club) => (club.counts?.players || club._count.players) >= filters.minMembers!
      );
    }
    if (filters.maxMembers !== undefined) {
      filtered = filtered.filter(
        (club) => (club.counts?.players || club._count.players) <= filters.maxMembers!
      );
    }

    // Apply role-based filters (filter clubs that have members with selected roles)
    if (filters.roles && filters.roles.length > 0) {
      filtered = filtered.filter((club) => {
        if (!club.counts) return false;
        
        // Check if club has any members with the selected roles
        return filters.roles!.some((role) => {
          switch (role) {
            case 'MANAGER':
              return club.counts!.managers > 0;
            case 'MENTOR':
              return club.counts!.mentors > 0;
            case 'CAPTAIN':
              return club.counts!.captains > 0;
            case 'PLAYER':
              return club.counts!.players > 0;
            default:
              return false;
          }
        });
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'members':
            comparison = (a.counts?.players || a._count.players) - (b.counts?.players || b._count.players);
            break;
          case 'createdAt':
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
    const paginatedClubs = filtered.slice(startIndex, endIndex);

    return { paginatedClubs, totalPages, totalFiltered };
  }, [clubs, filters, currentPage, pageSize]);

  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/clubs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }

      const data = await response.json();
      
      // Fetch role counts for each club
      const clubsWithCounts = await Promise.all(
        data.map(async (club: Club) => {
          try {
            const hierarchyResponse = await fetch(`/api/clubs/${club.id}/hierarchy`);
            if (hierarchyResponse.ok) {
              const hierarchy = await hierarchyResponse.json();
              return {
                ...club,
                counts: {
                  managers: hierarchy.managers.length,
                  mentors: hierarchy.mentors.length,
                  captains: hierarchy.captains.length,
                  players: hierarchy.players.length,
                },
              };
            }
          } catch (error) {
            console.error(`Error fetching hierarchy for club ${club.id}:`, error);
          }
          return club;
        })
      );
      
      setClubs(clubsWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (club: Club) => {
    setDeleteDialog({
      isOpen: true,
      clubId: club.id,
      clubName: club.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.clubId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clubs/${deleteDialog.clubId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete club');
      }

      // Remove club from state
      setClubs(clubs.filter((c) => c.id !== deleteDialog.clubId));
      setDeleteDialog({ isOpen: false, clubId: null, clubName: '' });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete club');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="mb-6 flex justify-end">
          <Button variant="primary" disabled>Create New Club</Button>
        </div>
        <ClubCardSkeleton count={6} />
      </>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchClubs}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <FilterPanel
        onFilterChange={handleFilterChange}
        showRoleFilters={true}
        showMemberCountFilters={true}
        showSortOptions={true}
        availableRoles={['MANAGER', 'MENTOR', 'CAPTAIN', 'PLAYER']}
        sortOptions={[
          { value: 'name', label: 'Name' },
          { value: 'members', label: 'Member Count' },
          { value: 'createdAt', label: 'Created Date' },
        ]}
        className="mb-6"
      />

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600" role="status" aria-live="polite">
          Showing <span className="font-medium text-gray-900">{((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalFiltered)}</span> of <span className="font-medium text-gray-900">{totalFiltered}</span> clubs
        </p>
        {clubs.length !== totalFiltered && (
          <span className="text-xs text-gray-500">({clubs.length} total)</span>
        )}
      </div>

      {paginatedClubs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#FFB700]/20 rounded-lg flex items-center justify-center mx-auto mb-4 border-t-2 border-[#FFB700]">
              <svg
                className="w-8 h-8 text-[#FF6600]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
              {clubs.length === 0 ? 'No clubs yet' : 'No clubs match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {clubs.length === 0
                ? 'Get started by creating your first club to manage members and tournaments'
                : 'Try adjusting your search or filter criteria to find what you\'re looking for'}
            </p>
            {clubs.length === 0 && (
              <Link href="/dashboard/clubs/new">
                <button className="inline-flex items-center px-5 py-2.5 bg-[#FF6600] text-white rounded-lg hover:bg-[#CC2900] transition-colors font-medium border-t-2 border-[#FFB700]">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Club
                </button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3" role="list" aria-label="Clubs list">
            {paginatedClubs.map((club) => (
              <div key={club.id} className="bg-white rounded-lg border border-gray-200 hover:border-[#FFB700] transition-colors overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
                  {/* Logo - Left Side - Clickable */}
                  <Link href={`/dashboard/clubs/${club.id}`} className="flex-shrink-0">
                    {club.logo ? (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-[#E4E5E7] flex items-center justify-center p-2">
                        <OptimizedImage
                          src={club.logo}
                          alt={`${club.name} logo`}
                          width={56}
                          height={56}
                          className="object-contain w-full h-full"
                          sizes="(max-width: 640px) 56px, 64px"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FF6600] rounded-lg flex items-center justify-center border-t-2 border-[#FFB700]">
                        <span className="text-white font-bold text-xl sm:text-2xl">
                          {club.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Club Info - Center - Clickable */}
                  <Link href={`/dashboard/clubs/${club.id}`} className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A] mb-1 truncate hover:text-[#FF6600] transition-colors">
                      {club.name}
                    </h3>
                    {club.description && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-1">
                        {club.description}
                      </p>
                    )}
                    
                    {/* Stats - Responsive */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      {[
                        { label: 'Managers', short: 'Mgr', value: club.counts?.managers || 0, color: 'bg-blue-500' },
                        { label: 'Mentors', short: 'Mnt', value: club.counts?.mentors || 0, color: 'bg-purple-500' },
                        { label: 'Captains', short: 'Cap', value: club.counts?.captains || 0, color: 'bg-amber-500' },
                        { label: 'Players', short: 'Ply', value: club.counts?.players || club._count.players, color: 'bg-emerald-500' },
                      ].map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                          <span className="text-xs text-gray-600">
                            <span className="font-bold text-gray-900">{stat.value}</span>{' '}
                            <span className="hidden sm:inline">{stat.label}</span>
                            <span className="sm:hidden">{stat.short}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </Link>

                  {/* Actions - Right Side / Bottom on Mobile */}
                  <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                    <Link href={`/dashboard/clubs/${club.id}/edit`} className="flex-1 sm:flex-none">
                      <button className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(club)}
                      className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                      aria-label={`Delete ${club.name}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
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

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, clubId: null, clubName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Club"
        message={`Are you sure you want to delete "${deleteDialog.clubName}"? This will also remove all associated managers, mentors, captains, and players. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
