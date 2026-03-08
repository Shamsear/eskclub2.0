'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AchievementBadge } from './Badge';
import { PageLoader } from './PageLoader';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface Club {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  playerCount: number;
  tournamentCount: number;
  achievements: Array<{
    type: 'tournament_win' | 'top_scorer' | 'most_active';
    label: string;
  }>;
}

interface ClubListResponse {
  clubs: Club[];
  pagination: { page: number; pageSize: number; total: number };
}

export default function ClubListingClient() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchClubs(); }, [page]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/public/clubs?page=${page}&pageSize=12`);
      if (!res.ok) throw new Error('Failed to fetch clubs');
      const data: ClubListResponse = await res.json();
      setClubs(data.clubs);
      setTotalPages(Math.ceil(data.pagination.total / data.pagination.pageSize));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── Error ── */
  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/40 p-10 text-center" style={{ background: '#111' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.1)' }}>
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 font-bold mb-1">Error loading clubs</p>
        <p className="text-red-600 text-sm mb-5">{error}</p>
        <button onClick={fetchClubs}
          className="px-6 py-2.5 rounded-xl text-white font-black text-sm"
          style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search clubs by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#1E1E1E] text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#FF6600]/50 transition-all"
          style={{ background: '#111' }}
          aria-label="Search clubs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#555] hover:text-[#FF6600] transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && filteredClubs.length > 0 && (
        <div className="text-sm text-[#555]">
          Showing <span className="font-black text-white">{filteredClubs.length}</span>{' '}
          {filteredClubs.length === 1 ? 'club' : 'clubs'}
        </div>
      )}

      {/* Loading */}
      {loading && <PageLoader label="Loading clubs..." />}

      {/* Club Grid */}
      {!loading && filteredClubs.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {filteredClubs.map((club, index) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 32, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(index, 5) * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => router.push(`/clubs/${club.id}`)}
                className="group rounded-2xl border border-[#1E1E1E] hover:border-[#FF6600]/50 transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: '#111' }}
              >
                {/* Top accent line */}
                <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,#FF6600,transparent)' }} />

                <div className="p-6">
                  {/* Logo */}
                  <div className="flex justify-center mb-4">
                    {club.logo ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF6600]/40 group-hover:scale-110 transition-transform duration-300">
                        <OptimizedImage
                          src={club.logo}
                          alt={`${club.name} logo`}
                          width={80} height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-[#FF6600]/40 group-hover:scale-110 transition-transform duration-300"
                        style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
                        <span className="text-3xl font-black text-white">
                          {club.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-sm sm:text-xl font-black text-white group-hover:text-[#FFB700] transition-colors text-center mb-1 sm:mb-2 line-clamp-2">
                    {club.name}
                  </h3>

                  {/* Description */}
                  {club.description && (
                    <p className="text-xs text-[#555] text-center mb-3 sm:mb-4 line-clamp-2 min-h-[32px] hidden sm:block">
                      {club.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex justify-center items-center py-3 sm:py-4 border-t border-b border-[#1A1A1A] my-3 sm:my-4">
                    <div className="text-center">
                      <p className="text-lg sm:text-2xl font-black text-[#FF6600]">{club.playerCount}</p>
                      <p className="text-[9px] sm:text-xs text-[#555] mt-1 font-medium">Players</p>
                    </div>
                  </div>

                  {/* Achievements */}
                  {club.achievements.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {club.achievements.map((achievement, idx) => (
                        <AchievementBadge
                          key={idx}
                          type={achievement.type}
                          label={achievement.label}
                          size="sm"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover bar */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-[#1E1E1E] text-[#A0A0A0] hover:text-white hover:border-[#FF6600]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                style={{ background: '#111' }}
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-black text-white">
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
        </>
      )}

      {/* Empty State */}
      {!loading && filteredClubs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#1E1E1E] p-16 text-center" style={{ background: '#111' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(255,102,0,0.08)' }}>
            <svg className="w-10 h-10 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-white mb-2">No clubs found</h3>
          <p className="text-sm text-[#555] mb-6">
            {searchQuery ? 'Try adjusting your search query' : 'No clubs are available at the moment'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-2.5 rounded-xl text-white font-black text-sm"
              style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
