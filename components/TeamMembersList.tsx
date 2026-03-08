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

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  place?: string | null;
  dateOfBirth?: string | null;
  photo?: string | null;
  createdAt: string;
  updatedAt: string;
  roles?: PlayerRole[];
}

interface TeamMembersListProps {
  members: TeamMember[];
  clubId: string;
  roleType: 'managers' | 'mentors' | 'captains' | 'players';
  showRoleFilters?: boolean;
}

export function TeamMembersList({
  members,
  clubId,
  roleType,
  showRoleFilters = false,
}: TeamMembersListProps) {
  const [filters, setFilters] = useState<FilterConfig>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const handleFilterChange = useCallback((newFilters: FilterConfig) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Filter, sort, and paginate members
  const { paginatedMembers, totalPages, totalFiltered } = useMemo(() => {
    let filtered = [...members];

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(search) ||
          member.email.toLowerCase().includes(search) ||
          member.place?.toLowerCase().includes(search)
      );
    }

    // Apply role filter if roles are available
    if (showRoleFilters && filters.roles && filters.roles.length > 0 && members[0]?.roles) {
      filtered = filtered.filter((member) =>
        filters.roles!.some((role) =>
          member.roles?.some((r) => r.role === role)
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
    const paginatedMembers = filtered.slice(startIndex, endIndex);

    return { paginatedMembers, totalPages, totalFiltered };
  }, [members, filters, showRoleFilters, currentPage, pageSize]);

  const getRoleBadges = (roles?: PlayerRole[]) => {
    if (!roles) return null;

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

  const getAvatarColor = () => {
    const colors: Record<string, string> = {
      managers: 'bg-blue-100 text-blue-600',
      mentors: 'bg-green-100 text-green-600',
      captains: 'bg-purple-100 text-purple-600',
      players: 'bg-orange-100 text-orange-600',
    };
    return colors[roleType] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      {/* Filters */}
      <FilterPanel
        onFilterChange={handleFilterChange}
        showRoleFilters={showRoleFilters}
        showMemberCountFilters={false}
        showSortOptions={true}
        availableRoles={showRoleFilters ? ['MANAGER', 'MENTOR', 'CAPTAIN', 'PLAYER'] : []}
        sortOptions={[
          { value: 'name', label: 'Name' },
          { value: 'email', label: 'Email' },
          { value: 'joinDate', label: 'Join Date' },
        ]}
        className="mb-6"
      />

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600" role="status" aria-live="polite">
        Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalFiltered)} of {totalFiltered} filtered members ({members.length} total)
      </div>

      {/* Members List */}
      {paginatedMembers.length === 0 ? (
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
              {members.length === 0 ? `No ${roleType} yet` : `No ${roleType} match your filters`}
            </h3>
            <p className="text-gray-600 mb-6">
              {members.length === 0
                ? `Get started by adding a ${roleType.slice(0, -1)} to this club.`
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {members.length === 0 && (
              <Link href={`/dashboard/clubs/${clubId}/${roleType}/new`}>
                <Button variant="primary">Add First {roleType.slice(0, -1).charAt(0).toUpperCase() + roleType.slice(1, -1)}</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4" role="list" aria-label={`${roleType} list`}>
            {paginatedMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4 flex-1">
                    {member.photo ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <OptimizedImage
                          src={member.photo}
                          alt={`${member.name}'s profile photo`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div 
                        className={`w-16 h-16 rounded-full ${getAvatarColor()} flex items-center justify-center flex-shrink-0`}
                        aria-label={`${member.name}'s avatar`}
                      >
                        <span className="text-2xl font-semibold" aria-hidden="true">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {member.name}
                      </h3>
                      <p className="text-gray-600 truncate">
                        <a href={`mailto:${member.email}`} className="hover:underline">
                          {member.email}
                        </a>
                      </p>
                      {member.roles && member.roles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2" aria-label="Member roles">
                          {getRoleBadges(member.roles)}
                        </div>
                      )}
                      {member.phone && (
                        <p className="text-sm text-gray-500 mt-1">
                          <a href={`tel:${member.phone}`} className="hover:underline">
                            {member.phone}
                          </a>
                        </p>
                      )}
                      {member.place && (
                        <p className="text-sm text-gray-500">{member.place}</p>
                      )}
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/clubs/${clubId}/${roleType}/${member.id}`}
                    aria-label={`View ${member.name}'s profile`}
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
