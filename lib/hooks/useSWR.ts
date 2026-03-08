'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { useCallback } from 'react';

/**
 * Default fetcher function for SWR
 */
const defaultFetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object
    (error as any).info = await res.json();
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
};

/**
 * Default SWR configuration with optimized settings
 */
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: true,
  keepPreviousData: true, // Keep previous data while revalidating
};

/**
 * Custom hook for data fetching with SWR
 * Provides request deduplication, caching, and revalidation
 */
export function useData<T>(
  url: string | null,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    url,
    defaultFetcher,
    { ...defaultConfig, ...config }
  );

  const refresh = useCallback(() => {
    return mutate();
  }, [mutate]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    refresh,
  };
}

/**
 * Hook for fetching tournament data
 */
export function useTournament(id: number | string | null) {
  return useData(
    id ? `/api/public/tournaments/${id}` : null
  );
}

/**
 * Hook for fetching tournament list
 */
export function useTournaments(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  
  const queryString = searchParams.toString();
  const url = `/api/public/tournaments${queryString ? `?${queryString}` : ''}`;
  
  return useData(url);
}

/**
 * Hook for fetching match data
 */
export function useMatch(id: number | string | null) {
  return useData(
    id ? `/api/public/matches/${id}` : null
  );
}

/**
 * Hook for fetching player data
 */
export function usePlayer(id: number | string | null) {
  return useData(
    id ? `/api/public/players/${id}` : null
  );
}

/**
 * Hook for fetching club data
 */
export function useClub(id: number | string | null) {
  return useData(
    id ? `/api/public/clubs/${id}` : null
  );
}

/**
 * Hook for fetching clubs list
 */
export function useClubs(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  
  const queryString = searchParams.toString();
  const url = `/api/public/clubs${queryString ? `?${queryString}` : ''}`;
  
  return useData(url);
}

/**
 * Hook for fetching players list
 */
export function usePlayers(params?: {
  search?: string;
  clubId?: number;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.clubId) searchParams.set('clubId', params.clubId.toString());
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  
  const queryString = searchParams.toString();
  const url = `/api/public/players${queryString ? `?${queryString}` : ''}`;
  
  return useData(url);
}

/**
 * Hook for fetching tournament leaderboard
 */
export function useLeaderboard(tournamentId: number | string | null) {
  return useData(
    tournamentId ? `/api/public/tournaments/${tournamentId}/leaderboard` : null
  );
}
