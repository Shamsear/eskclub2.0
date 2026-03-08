'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

/**
 * SWR Provider with optimized global configuration
 * Provides request deduplication, caching, and error handling
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Fetcher function
        fetcher: async (url: string) => {
          const res = await fetch(url);
          
          if (!res.ok) {
            const error = new Error('An error occurred while fetching the data.');
            (error as any).info = await res.json().catch(() => ({}));
            (error as any).status = res.status;
            throw error;
          }
          
          return res.json();
        },
        
        // Revalidation options
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        
        // Deduplication
        dedupingInterval: 2000, // 2 seconds
        
        // Error handling
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        shouldRetryOnError: true,
        
        // Performance
        keepPreviousData: true,
        
        // Loading delay
        loadingTimeout: 3000,
        
        // Error handler
        onError: (error, key) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(`SWR Error for ${key}:`, error);
          }
        },
        
        // Success handler
        onSuccess: (data, key) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`SWR Success for ${key}`);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
