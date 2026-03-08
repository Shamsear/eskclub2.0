'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicCard } from './PublicCard';
import { RoleBadge } from './Badge';
import { PageLoader } from './PageLoader';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface Player {
  id: number;
  name: string;
  photo: string | null;
  roles: Array<'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER'>;
  stats: {
    totalMatches: number;
    totalPoints: number;
    winRate: number;
  };
}

interface ClubStats {
  totalPlayers: number;
  totalGoals: number;
}

interface ClubProfileData {
  club: {
    id: number;
    name: string;
    logo: string | null;
    description: string | null;
    createdAt: string;
  };
  players: Player[];
  stats: ClubStats;
}

interface ClubProfileClientProps {
  clubId: string;
}

export default function ClubProfileClient({ clubId }: ClubProfileClientProps) {
  const router = useRouter();
  const [data, setData] = useState<ClubProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchClubProfile();
  }, [clubId]);

  const fetchClubProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/clubs/${clubId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Club not found');
        }
        throw new Error('Failed to fetch club profile');
      }

      const clubData: ClubProfileData = await response.json();
      setData(clubData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-[#0D0D0D] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-900/40 p-8 text-center" style={{ background: '#111' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 font-bold text-lg mb-2">Error loading club profile</p>
            <p className="text-red-600 text-sm mb-6">{error}</p>
            <button onClick={fetchClubProfile} className="px-6 py-3 rounded-xl text-white font-bold transition-colors" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="bg-[#0D0D0D] min-h-screen flex items-center justify-center">
        <PageLoader label="Loading club..." />
      </div>
    );
  }

  const { club, players, stats } = data;

  // Sort players by role hierarchy: MANAGER > CAPTAIN > MENTOR > PLAYER
  const roleOrder = { MANAGER: 1, CAPTAIN: 2, MENTOR: 3, PLAYER: 4 };
  const sortedPlayers = [...players].sort((a, b) => {
    // Get the highest priority role for each player
    const aHighestRole = Math.min(...a.roles.map(role => roleOrder[role]));
    const bHighestRole = Math.min(...b.roles.map(role => roleOrder[role]));
    return aHighestRole - bHighestRole;
  });

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      {/* Hero Section with Club Info */}
      <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Orange Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/20 via-transparent to-[#CC2900]/20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Club Logo */}
            <div className="flex-shrink-0">
              {club.logo ? (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-[#FF6600] overflow-hidden shadow-2xl bg-white transform hover:scale-105 transition-transform duration-300">
                  <OptimizedImage
                    src={club.logo}
                    alt={`${club.name} logo`}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-[#FF6600] to-[#CC2900] border-4 border-[#FFB700] flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <span className="text-6xl sm:text-7xl font-bold text-white">
                    {club.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Club Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
                {club.name}
              </h1>

              {club.description && (
                <p className="text-base sm:text-lg text-gray-300 mb-6 max-w-3xl leading-relaxed">
                  {club.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <svg className="w-5 h-5 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/90">
                    Since {new Date(club.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <svg className="w-5 h-5 text-[#FFB700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-white/90">{stats.totalPlayers} Members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Players', value: stats.totalPlayers, color: '#FF6600' },
            { label: 'Total Goals', value: stats.totalGoals, color: '#FFB700' },
            { label: 'Avg Points', value: stats.totalPlayers > 0 ? Math.round(players.reduce((s, p) => s + p.stats.totalPoints, 0) / stats.totalPlayers) : 0, color: '#CC2900' },
            { label: 'Avg Win Rate', value: `${stats.totalPlayers > 0 ? (players.reduce((s, p) => s + p.stats.winRate, 0) / stats.totalPlayers).toFixed(1) : 0}%`, color: '#FF6600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-[#1E1E1E] p-5 text-center hover:-translate-y-1 transition-all duration-300" style={{ background: '#111' }}>
              <div className="text-2xl font-black mb-1" style={{ color }}>{value}</div>
              <div className="text-xs text-[#555] font-medium uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Players Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg,#FF6600,#CC2900)" }} />
            <h2 className="text-2xl font-black text-white font-['Outfit',sans-serif]">Club Roster</h2>
          </div>
          <p className="text-xs text-[#555] mt-1.5 ml-7">Meet the talented members of {club.name}</p>
        </div>

        {/* Players Grid */}
        {sortedPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedPlayers.map((player) => (
              <div key={player.id} onClick={() => router.push(`/players/${player.id}`)}
                className="rounded-2xl border border-[#1E1E1E] hover:border-[#FF6600]/40 transition-all duration-300 overflow-hidden cursor-pointer group hover:-translate-y-1" style={{ background: '#111' }}>
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Player Photo */}
                    <div className="relative flex-shrink-0">
                      {player.photo ? (
                        <div className="w-18 h-18 rounded-xl overflow-hidden border border-[#FF6600]/40 shadow-lg" style={{ width: '72px', height: '72px' }}>
                          <OptimizedImage src={player.photo} alt={player.name} width={72} height={72} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="w-[72px] h-[72px] rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>
                          <span className="text-2xl font-black text-white">{player.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      {/* Active Indicator */}
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#111]"></div>
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-white mb-2 truncate group-hover:text-[#FFB700] transition-colors">{player.name}</h3>
                      <div className="flex flex-wrap gap-1">
                        {player.roles.map((role) => <RoleBadge key={role} role={role} size="sm" />)}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#1A1A1A]">
                    <div className="text-center">
                      <div className="text-xs text-[#555] mb-1 font-medium">Matches</div>
                      <div className="text-base font-black text-white">{player.stats.totalMatches}</div>
                    </div>
                    <div className="text-center border-x border-[#1A1A1A]">
                      <div className="text-xs text-[#555] mb-1 font-medium">Points</div>
                      <div className="text-base font-black" style={{ color: '#FF6600' }}>{player.stats.totalPoints}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[#555] mb-1 font-medium">Win Rate</div>
                      <div className="text-base font-black" style={{ color: '#FFB700' }}>{player.stats.winRate.toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#1E1E1E] text-center py-16" style={{ background: '#111' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,102,0,0.08)' }}>
              <svg className="w-10 h-10 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2">No Players Yet</h3>
            <p className="text-sm text-[#555] max-w-md mx-auto">This club is just getting started. Check back soon to see the roster!</p>
          </div>
        )}
      </div>
    </div>
  );
}