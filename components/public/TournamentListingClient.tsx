'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatusBadge } from './Badge';
import { PageLoader } from './PageLoader';
import { SearchBar, HighlightedText } from './SearchBar';
import { FilterPanel, FilterConfig } from './FilterPanel';
import { SearchEmptyState, FilterEmptyState } from './EmptyState';
import { applyFilters, getActiveFilterCount } from '@/lib/utils/filterUtils';

interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string | null;
  participantCount: number;
  matchCount: number;
  status: 'upcoming' | 'active' | 'completed';
}

interface TournamentListResponse {
  tournaments: Tournament[];
  pagination: { page: number; pageSize: number; total: number };
}

const statusAccent: Record<string, string> = {
  active: '#22C55E',
  upcoming: '#FFB700',
  completed: '#555',
};

export default function TournamentListingClient() {
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterConfig>({});
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => { fetchTournaments(); }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/public/tournaments?page=1&pageSize=1000');
      if (!res.ok) throw new Error('Failed to fetch tournaments');
      const data: TournamentListResponse = await res.json();
      setAllTournaments(data.tournaments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = useMemo(() =>
    applyFilters(allTournaments, { ...filters, search: searchQuery }, ['name']),
    [allTournaments, filters, searchQuery]
  );

  const paginatedTournaments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTournaments.slice(start, start + pageSize);
  }, [filteredTournaments, page]);

  const totalPages = Math.ceil(filteredTournaments.length / pageSize);
  const activeFilterCount = getActiveFilterCount(filters);

  useEffect(() => { setPage(1); }, [filters, searchQuery]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

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
        <p className="text-red-400 font-bold mb-1">Error loading tournaments</p>
        <p className="text-red-600 text-sm mb-5">{error}</p>
        <button onClick={fetchTournaments}
          className="px-6 py-2.5 rounded-xl text-white font-black text-sm"
          style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search tournaments by name..."
          onClear={() => setSearchQuery('')}
        />
      </div>

      {/* Layout: cards + sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tournament Grid */}
        <div className="flex-1">
          {/* Results count */}
          {!loading && (
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-[#555]">
                <span className="font-bold text-white">{paginatedTournaments.length}</span>
                {' '}of{' '}
                <span className="font-bold text-white">{filteredTournaments.length}</span>
                {' '}tournaments
                {(searchQuery || activeFilterCount > 0) && (
                  <span className="ml-2 text-[#FF6600] font-medium">
                    (filtered from {allTournaments.length} total)
                  </span>
                )}
              </div>
              {(searchQuery || activeFilterCount > 0) && (
                <button
                  onClick={() => { setFilters({}); setSearchQuery(''); }}
                  className="text-sm text-[#FF6600] hover:text-[#FFB700] font-bold transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="col-span-full">
              <PageLoader label="Loading tournaments..." />
            </div>
          ) : paginatedTournaments.length === 0 ? (
            searchQuery ? (
              <SearchEmptyState searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} />
            ) : activeFilterCount > 0 ? (
              <FilterEmptyState onClearFilters={() => { setFilters({}); setSearchQuery(''); }} activeFilterCount={activeFilterCount} />
            ) : (
              <div className="rounded-2xl border border-dashed border-[#1E1E1E] p-16 text-center" style={{ background: '#111' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(255,102,0,0.08)' }}>
                  <svg className="w-10 h-10 text-[#FF6600]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-2">No tournaments found</h3>
                <p className="text-sm text-[#555]">There are no tournaments available at the moment.</p>
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedTournaments.map((tournament, index) => {
                  const accent = statusAccent[tournament.status] ?? '#555';
                  return (
                    <motion.div
                      key={tournament.id}
                      initial={{ opacity: 0, y: 32, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{
                        duration: 0.5,
                        delay: Math.min(index, 5) * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link href={`/tournaments/${tournament.id}`} className="group block h-full">
                          <div className="h-full rounded-2xl border border-[#1E1E1E] hover:border-[#FF6600]/50 transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-2xl"
                            style={{ background: '#111' }}>

                            {/* Top accent line */}
                            <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />

                            <div className="p-5">
                              {/* Name + Status */}
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <h3 className="text-base font-black text-white group-hover:text-[#FFB700] transition-colors line-clamp-2 flex-1 leading-snug">
                                  <HighlightedText text={tournament.name} highlight={searchQuery} />
                                </h3>
                                <div className="flex-shrink-0">
                                  <StatusBadge status={tournament.status} size="sm" />
                                </div>
                              </div>

                              {/* Date */}
                              <div className="flex items-center gap-2 text-xs text-[#555] mb-3">
                                <svg className="w-3.5 h-3.5 text-[#FF6600] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>
                                  {formatDate(tournament.startDate)}
                                  {tournament.endDate && ` — ${formatDate(tournament.endDate)}`}
                                </span>
                              </div>

                              {/* Players & Matches */}
                              <div className="flex items-center gap-4 mb-5">
                                <div className="flex items-center gap-1.5 text-xs text-[#555]">
                                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,102,0,0.1)' }}>
                                    <svg className="w-3.5 h-3.5 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </div>
                                  <span><span className="font-black text-white">{tournament.participantCount}</span> players</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[#555]">
                                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,183,0,0.08)' }}>
                                    <svg className="w-3.5 h-3.5 text-[#FFB700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                  </div>
                                  <span><span className="font-black text-white">{tournament.matchCount}</span> matches</span>
                                </div>
                              </div>

                              {/* CTA */}
                              <div className="pt-4 border-t border-[#1A1A1A]">
                                <span className="text-sm font-black text-[#FF6600] group-hover:text-[#FFB700] flex items-center gap-2 transition-colors">
                                  View Tournament
                                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </span>
                              </div>
                            </div>

                            {/* Bottom hover bar */}
                            <div className="h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-[#1E1E1E] text-[#A0A0A0] hover:text-white hover:border-[#FF6600]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                    style={{ background: '#111' }}
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const p = i + 1;
                      if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${page === p
                              ? 'text-white shadow-lg'
                              : 'border border-[#1E1E1E] text-[#555] hover:text-white hover:border-[#FF6600]/40'
                              }`}
                            style={page === p ? { background: 'linear-gradient(135deg,#FF6600,#CC2900)' } : { background: '#111' }}
                            aria-current={page === p ? 'page' : undefined}
                          >
                            {p}
                          </button>
                        );
                      } else if (p === page - 2 || p === page + 2) {
                        return <span key={p} className="text-[#333] font-bold">…</span>;
                      }
                      return null;
                    })}
                  </div>
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
        </div>

        {/* Filter Sidebar */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="sticky top-20">
            <div className="rounded-2xl border border-[#1E1E1E] p-5" style={{ background: '#111' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg,#FF6600,#CC2900)' }}>
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                filterSections={[
                  {
                    id: 'status',
                    title: 'Status',
                    type: 'checkbox',
                    options: [
                      { value: 'upcoming', label: 'Upcoming' },
                      { value: 'active', label: 'Active' },
                      { value: 'completed', label: 'Completed' },
                    ],
                  },
                  {
                    id: 'participantCount',
                    title: 'Participants',
                    type: 'range',
                    min: 0,
                    max: 100,
                  },
                ]}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
