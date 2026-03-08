'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RoleBadge } from './Badge';
import { PageLoader } from './PageLoader';

interface Player {
  id: number;
  name: string;
  photo: string | null;
  place: string | null;
  club: { id: number; name: string; logo: string | null } | null;
  roles: Array<'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER'>;
  stats: {
    totalMatches: number;
    totalPoints: number;
    totalGoalsScored: number;
    winRate: number;
  };
}

interface PlayerListingResponse {
  players: Player[];
  pagination: { page: number; pageSize: number; total: number };
}



export default function PlayerListingClient() {
  const router = useRouter();
  const [data, setData] = useState<PlayerListingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: page.toString(), pageSize: '20' });
        if (debouncedSearch) params.append('search', debouncedSearch);
        const res = await fetch(`/api/public/players?${params}`);
        if (!res.ok) throw new Error('Failed to fetch players');
        setData(await res.json());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [debouncedSearch, page]);

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.pageSize) : 0;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/40 p-10 text-center" style={{ background: '#111' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.1)' }}>
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 font-bold mb-1">Error loading players</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search players by name, place..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-[#1E1E1E] text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#FF6600]/50 transition-all"
          style={{ background: '#111' }}
          aria-label="Search players"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#555] hover:text-[#FF6600] transition-colors"
            aria-label="Clear search">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results count */}
      {data && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-[#555]"
        >
          Showing <span className="font-black text-white">{data.players.length}</span> of{' '}
          <span className="font-black text-white">{data.pagination.total}</span> players
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        {loading ? (
          <div className="col-span-full">
            <PageLoader label="Loading players..." />
          </div>
        ) : data && data.players.length > 0 ? (
          data.players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.5,
                delay: Math.min(index, 5) * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => router.push(`/players/${player.id}`)}
              className="group rounded-2xl border border-[#1E1E1E] hover:border-[#FF6600]/50 transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: '#111' }}
            >
              {/* Photo — capped height on mobile, square on sm+ */}
              <div className="h-36 sm:h-auto sm:aspect-square relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,rgba(255,102,0,0.08),rgba(255,183,0,0.05))' }}>
                {player.photo ? (
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 sm:w-20 sm:h-20 text-[#FF6600]/20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div>
                  <h3 className="font-black text-sm sm:text-lg text-white group-hover:text-[#FFB700] transition-colors truncate">
                    {player.name}
                  </h3>
                  {player.place && (
                    <p className="text-xs text-[#555] truncate flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {player.place}
                    </p>
                  )}
                </div>

                {/* Club badge */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg border border-[#1A1A1A]" style={{ background: '#0D0D0D' }}>
                  {player.club ? (
                    <>
                      {player.club.logo ? (
                        <img src={player.club.logo} alt={player.club.name} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
                          <span className="text-[9px] text-white font-black">{player.club.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="text-[10px] sm:text-xs text-[#A0A0A0] font-medium truncate">{player.club.name}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-[#1E1E1E] flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] text-[#555] font-black">F</span>
                      </div>
                      <span className="text-xs text-[#555] font-medium">Free Agent</span>
                    </>
                  )}
                </div>

                {/* Roles */}
                <div className="flex flex-wrap gap-1">
                  {player.roles.map((role) => (
                    <RoleBadge key={role} role={role} size="sm" />
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-2 sm:pt-3 border-t border-[#1A1A1A]">
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-black text-white">{player.stats.totalMatches}</div>
                    <div className="text-[9px] sm:text-[10px] text-[#555] mt-0.5">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-black text-[#FF6600]">{player.stats.totalPoints}</div>
                    <div className="text-[9px] sm:text-[10px] text-[#555] mt-0.5">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-black text-[#FFB700]">{player.stats.winRate.toFixed(0)}%</div>
                    <div className="text-[9px] sm:text-[10px] text-[#555] mt-0.5">Win %</div>
                  </div>
                </div>
              </div>

              {/* Hover sweep bar */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-[#1E1E1E] p-16 text-center" style={{ background: '#111' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(255,102,0,0.08)' }}>
              <svg className="w-10 h-10 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2">No players found</h3>
            <p className="text-sm text-[#555]">
              {searchQuery ? 'Try adjusting your search criteria' : 'No players are available at the moment'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="mt-5 px-6 py-2.5 rounded-xl text-white font-black text-sm"
                style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-[#1E1E1E] text-[#A0A0A0] hover:text-white hover:border-[#FF6600]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
            style={{ background: '#111' }}
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm font-black text-white">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-[#1E1E1E] text-[#A0A0A0] hover:text-white hover:border-[#FF6600]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
            style={{ background: '#111' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
