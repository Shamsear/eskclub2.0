'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/dialog';

interface PlayerRole {
  id: number;
  role: string;
  createdAt: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  place?: string | null;
  dateOfBirth?: string | null;
  photo?: string | null;
  roles?: PlayerRole[];
}

interface ClubData {
  club: {
    id: number;
    name: string;
    logo: string | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  };
  managers: Member[];
  mentors: Member[];
  captains: Member[];
  players: Member[];
  tournamentsCount: number;
}

interface ClubDetailsProps {
  clubData: ClubData;
}

const roleColors = {
  MANAGER: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    dot: 'bg-blue-600',
    cardBg: 'bg-blue-50',
    cardHover: 'hover:bg-blue-100',
  },
  MENTOR: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    dot: 'bg-green-600',
    cardBg: 'bg-green-50',
    cardHover: 'hover:bg-green-100',
  },
  CAPTAIN: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    dot: 'bg-purple-600',
    cardBg: 'bg-purple-50',
    cardHover: 'hover:bg-purple-100',
  },
  PLAYER: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    dot: 'bg-orange-600',
    cardBg: 'bg-orange-50',
    cardHover: 'hover:bg-orange-100',
  },
};

function RoleBadge({ role }: { role: string }) {
  const colors = roleColors[role as keyof typeof roleColors] || roleColors.PLAYER;
  
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
    >
      {role}
    </span>
  );
}

function MemberCard({ 
  member, 
  clubId, 
  primaryRole,
  onRemove
}: { 
  member: Member; 
  clubId: number; 
  primaryRole: string;
  onRemove: (memberId: number, memberName: string) => void;
}) {
  const colors = roleColors[primaryRole as keyof typeof roleColors] || roleColors.PLAYER;
  const memberRoles = member.roles || [];
  const hasMultipleRoles = memberRoles.length > 1;
  
  return (
    <div className={`group p-4 ${colors.cardBg} rounded-xl transition-all border ${colors.border} hover:shadow-lg`}>
      <div className="flex items-start justify-between gap-3">
        <Link 
          href={`/dashboard/clubs/${clubId}/players/${member.id}`}
          className="flex items-start gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            {member.photo ? (
              <img src={member.photo} alt={member.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <span className={`text-lg font-bold ${colors.text}`}>
                {member.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold text-gray-900 truncate">{member.name}</div>
              {hasMultipleRoles && (
                <span className="flex-shrink-0 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                  {memberRoles.length} roles
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 truncate mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {member.email}
            </div>
            {member.place && (
              <div className="text-xs text-gray-500 truncate mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {member.place}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {memberRoles.map((role) => (
                <RoleBadge key={role.id} role={role.role} />
              ))}
            </div>
          </div>
        </Link>
        
        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(member.id, member.name);
          }}
          className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove from club"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ClubDetails({ clubData }: ClubDetailsProps) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    playerAction: 'club-only' | 'club-and-players' | 'everything' | null;
  }>({
    isOpen: false,
    playerAction: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [removePlayerDialog, setRemovePlayerDialog] = useState<{
    isOpen: boolean;
    playerId: number | null;
    playerName: string;
    action: 'free-agent' | 'delete' | null;
  }>({
    isOpen: false,
    playerId: null,
    playerName: '',
    action: null,
  });
  const [isRemovingPlayer, setIsRemovingPlayer] = useState(false);

  const { club, managers, mentors, captains, players, tournamentsCount } = clubData;

  // Refresh data when component mounts or when returning from member pages
  // This enables real-time updates when structure or roles change
  const refreshData = () => {
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteDialog.playerAction) return;

    setIsDeleting(true);
    try {
      if (deleteDialog.playerAction === 'club-only') {
        // Make all players free agents before deleting club
        const uniqueMemberIds = new Set<number>();
        [...managers, ...mentors, ...captains, ...players].forEach(member => {
          uniqueMemberIds.add(member.id);
        });

        // Update each player to be a free agent
        const updatePromises = Array.from(uniqueMemberIds).map(playerId =>
          fetch(`/api/players/${playerId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clubId: null, isFreeAgent: true }),
          })
        );

        await Promise.all(updatePromises);
      } else if (deleteDialog.playerAction === 'club-and-players') {
        // Delete all players first
        const uniqueMemberIds = new Set<number>();
        [...managers, ...mentors, ...captains, ...players].forEach(member => {
          uniqueMemberIds.add(member.id);
        });

        // Delete each player
        const deletePromises = Array.from(uniqueMemberIds).map(playerId =>
          fetch(`/api/players/${playerId}`, {
            method: 'DELETE',
          })
        );

        await Promise.all(deletePromises);
      }
      // For 'everything', cascade delete will handle it

      const response = await fetch(`/api/clubs/${club.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deleteAction: deleteDialog.playerAction
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete club');
      }

      router.push('/dashboard/clubs');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete club');
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, playerAction: null });
    }
  };

  const handleRemovePlayer = (playerId: number, playerName: string) => {
    setRemovePlayerDialog({
      isOpen: true,
      playerId,
      playerName,
      action: null,
    });
  };

  const handleRemovePlayerConfirm = async () => {
    if (!removePlayerDialog.playerId || !removePlayerDialog.action) return;

    setIsRemovingPlayer(true);
    try {
      if (removePlayerDialog.action === 'free-agent') {
        // Make player a free agent (remove from club)
        const response = await fetch(`/api/players/${removePlayerDialog.playerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubId: null, isFreeAgent: true }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to remove player from club');
        }
      } else if (removePlayerDialog.action === 'delete') {
        // Delete player completely
        const response = await fetch(`/api/players/${removePlayerDialog.playerId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete player');
        }
      }

      setRemovePlayerDialog({ isOpen: false, playerId: null, playerName: '', action: null });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove player');
    } finally {
      setIsRemovingPlayer(false);
    }
  };

  // Calculate unique member count (members can have multiple roles)
  const uniqueMemberIds = new Set<number>();
  [...managers, ...mentors, ...captains, ...players].forEach(member => {
    uniqueMemberIds.add(member.id);
  });
  const totalMembers = uniqueMemberIds.size;

  return (
    <>
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <Link
            href="/dashboard/clubs"
            className="inline-flex items-center gap-2 text-white hover:text-emerald-100 transition-colors mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Clubs
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Logo */}
              {club.logo ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center p-2 flex-shrink-0">
                  <img
                    src={club.logo}
                    alt={`${club.name} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl sm:text-3xl">
                    {club.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Club Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{club.name}</h1>
                {club.description && (
                  <p className="text-emerald-100 text-sm sm:text-base">{club.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                    {totalMembers} Total Members
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Link href={`/dashboard/clubs/${club.id}/edit`}>
                <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </Link>
              <button 
                onClick={() => setDeleteDialog({ isOpen: true, playerAction: null })}
                className="px-4 py-2 bg-red-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-red-600 transition-all font-medium text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Managers', value: managers.length, gradient: 'from-blue-500 to-indigo-600', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { label: 'Mentors', value: mentors.length, gradient: 'from-purple-500 to-purple-600', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { label: 'Captains', value: captains.length, gradient: 'from-amber-500 to-orange-600', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
          { label: 'Total Members', value: totalMembers, gradient: 'from-emerald-500 to-teal-600', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-4 sm:p-5 text-white shadow-md hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs sm:text-sm text-white text-opacity-90">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-5 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Club Members</h2>
                <p className="text-sm text-gray-600 mt-0.5">{totalMembers} member{totalMembers !== 1 ? 's' : ''} across all roles</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href={`/dashboard/clubs/${club.id}/players/bulk`}>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all border border-gray-300 shadow-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Bulk Add
                </button>
              </Link>
              <Link href={`/dashboard/clubs/${club.id}/players/new`}>
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Member
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="p-6">
          {totalMembers === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No members yet</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">Get started by adding your first member to the club. You can add them individually or in bulk.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/dashboard/clubs/${club.id}/players/new`}>
                  <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add First Member
                  </button>
                </Link>
                <Link href={`/dashboard/clubs/${club.id}/players/bulk`}>
                  <button className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all border border-gray-300 shadow-sm font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Bulk Upload
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Combine all members into one list, removing duplicates */}
              {(() => {
                // Create a map to ensure unique members by ID
                const uniqueMembers = new Map<number, Member>();
                [...managers, ...mentors, ...captains, ...players].forEach(member => {
                  if (!uniqueMembers.has(member.id)) {
                    uniqueMembers.set(member.id, member);
                  }
                });
                
                // Convert to array and sort
                return Array.from(uniqueMembers.values())
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((member) => {
                    // Determine primary role for styling
                    const primaryRole = member.roles?.[0]?.role || 'PLAYER';
                    return (
                      <MemberCard 
                        key={member.id} 
                        member={member} 
                        clubId={club.id} 
                        primaryRole={primaryRole}
                        onRemove={handleRemovePlayer}
                      />
                    );
                  });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Custom Club Delete Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Club</h3>
                <p className="text-sm text-gray-600">Choose what to do with {totalMembers} member{totalMembers !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Club:</span> {club.name}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Members:</span> {totalMembers} total ({managers.length} managers, {mentors.length} mentors, {captains.length} captains, {players.length} players)
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setDeleteDialog({ ...deleteDialog, playerAction: 'club-only' })}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  deleteDialog.playerAction === 'club-only'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    deleteDialog.playerAction === 'club-only'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {deleteDialog.playerAction === 'club-only' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Delete Club Only</div>
                    <div className="text-sm text-gray-600">Delete club but keep all members as free agents. Members can join other clubs. Tournaments and match history are preserved.</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setDeleteDialog({ ...deleteDialog, playerAction: 'club-and-players' })}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  deleteDialog.playerAction === 'club-and-players'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    deleteDialog.playerAction === 'club-and-players'
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300'
                  }`}>
                    {deleteDialog.playerAction === 'club-and-players' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Delete Club and Players</div>
                    <div className="text-sm text-gray-600">Delete club and all members. Tournaments and match history are preserved but player references will be removed.</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setDeleteDialog({ ...deleteDialog, playerAction: 'everything' })}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  deleteDialog.playerAction === 'everything'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    deleteDialog.playerAction === 'everything'
                      ? 'border-red-500 bg-red-500'
                      : 'border-gray-300'
                  }`}>
                    {deleteDialog.playerAction === 'everything' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Delete Everything</div>
                    <div className="text-sm text-gray-600">Permanently delete club, all members, tournaments, and complete match history. This cannot be undone.</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteDialog({ isOpen: false, playerAction: null })}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!deleteDialog.playerAction || isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Club'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Remove Player Dialog */}
      {removePlayerDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Remove Player</h3>
                <p className="text-sm text-gray-600">Choose how to remove {removePlayerDialog.playerName}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setRemovePlayerDialog({ ...removePlayerDialog, action: 'free-agent' })}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  removePlayerDialog.action === 'free-agent'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    removePlayerDialog.action === 'free-agent'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {removePlayerDialog.action === 'free-agent' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Make Free Agent</div>
                    <div className="text-sm text-gray-600">Remove from club but keep player data. They can join another club later.</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRemovePlayerDialog({ ...removePlayerDialog, action: 'delete' })}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  removePlayerDialog.action === 'delete'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    removePlayerDialog.action === 'delete'
                      ? 'border-red-500 bg-red-500'
                      : 'border-gray-300'
                  }`}>
                    {removePlayerDialog.action === 'delete' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Delete Completely</div>
                    <div className="text-sm text-gray-600">Permanently delete player and all their data. This cannot be undone.</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRemovePlayerDialog({ isOpen: false, playerId: null, playerName: '', action: null })}
                disabled={isRemovingPlayer}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePlayerConfirm}
                disabled={!removePlayerDialog.action || isRemovingPlayer}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  removePlayerDialog.action === 'delete'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRemovingPlayer ? 'Processing...' : removePlayerDialog.action === 'delete' ? 'Delete Player' : 'Make Free Agent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
