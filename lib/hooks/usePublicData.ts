'use client';

import useSWR, { SWRConfiguration } from 'swr';

/**
 * Custom hook for fetching public data with SWR
 * Provides automatic caching, revalidation, and error handling
 */
export function usePublicData<T>(
  url: string | null,
  options?: SWRConfiguration
) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    options
  );

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook for fetching tournament list
 */
export function useTournaments(filters?: {
  status?: 'upcoming' | 'active' | 'completed';
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  
  const queryString = params.toString();
  const url = `/api/public/tournaments${queryString ? `?${queryString}` : ''}`;
  
  return usePublicData<any>(url);
}

/**
 * Hook for fetching tournament details
 */
export function useTournament(id: string | null) {
  const url = id ? `/api/public/tournaments/${id}` : null;
  return usePublicData<any>(url);
}

/**
 * Hook for fetching tournament leaderboard
 */
export function useTournamentLeaderboard(id: string | null) {
  const url = id ? `/api/public/tournaments/${id}/leaderboard` : null;
  return usePublicData<any>(url);
}

/**
 * Hook for fetching match details
 */
export function useMatch(id: string | null) {
  const url = id ? `/api/public/matches/${id}` : null;
  return usePublicData<any>(url);
}

/**
 * Hook for fetching player list
 */
export function usePlayers(filters?: {
  search?: string;
  clubId?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.clubId) params.set('clubId', filters.clubId);
  
  const queryString = params.toString();
  const url = `/api/public/players${queryString ? `?${queryString}` : ''}`;
  
  return usePublicData<any>(url);
}

/**
 * Hook for fetching player profile
 */
export function usePlayer(id: string | null) {
  const url = id ? `/api/public/players/${id}` : null;
  return usePublicData<any>(url);
}

/**
 * Hook for fetching club list
 */
export function useClubs(filters?: {
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  
  const queryString = params.toString();
  const url = `/api/public/clubs${queryString ? `?${queryString}` : ''}`;
  
  return usePublicData<any>(url);
}

/**
 * Hook for fetching club profile
 */
export function useClub(id: string | null) {
  const url = id ? `/api/public/clubs/${id}` : null;
  return usePublicData<any>(url);
}
