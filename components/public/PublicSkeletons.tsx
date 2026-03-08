'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

// Base dark skeleton block
function Skeleton({ className = '', width, height }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ background: '#1A1A1A', ...style }}
      aria-label="Loading..."
      role="status"
    />
  );
}

// ── Tournament Card Skeleton ──
export function TournamentCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-[#1E1E1E] p-5 animate-pulse" style={{ background: '#111' }}>
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3].map((j) => (
              <div key={j}>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

// ── Match Theater Skeleton ──
export function MatchTheaterSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl border border-[#1E1E1E] p-8" style={{ background: '#111' }}>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-6 w-64 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-[#1E1E1E] p-6" style={{ background: '#111' }}>
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j}>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-[#1E1E1E] p-6" style={{ background: '#111' }}>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard Skeleton ──
export function LeaderboardSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="rounded-2xl border border-[#1E1E1E] overflow-hidden animate-pulse" style={{ background: '#111' }}>
      <div className="p-4 border-b border-[#1A1A1A]">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="divide-y divide-[#1A1A1A]">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="hidden md:flex gap-8">
              {[1, 2, 3].map((j) => (
                <div key={j}>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-6 w-8" />
                </div>
              ))}
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Player Profile Skeleton ──
export function PlayerProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl border border-[#1E1E1E] p-8" style={{ background: '#111' }}>
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-32 w-32 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-[#1E1E1E] p-5" style={{ background: '#111' }}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-[#1E1E1E] p-6" style={{ background: '#111' }}>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-[#1A1A1A] rounded-xl">
              <Skeleton className="h-4 w-24" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Club Card Skeleton ──
export function ClubCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-[#1E1E1E] p-6 animate-pulse" style={{ background: '#111' }}>
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((j) => (
              <div key={j}>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Stat Card Skeleton ──
export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-[#1E1E1E] p-5 animate-pulse" style={{ background: '#111' }}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

// ── Tournament Journey Skeleton ──
export function TournamentJourneySkeleton() {
  return (
    <div className="rounded-2xl border border-[#1E1E1E] p-6 animate-pulse" style={{ background: '#111' }}>
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-64 border border-[#1A1A1A] rounded-xl p-4" style={{ background: '#0D0D0D' }}>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Generic Card Skeleton ──
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#1E1E1E] p-5 animate-pulse" style={{ background: '#111' }}>
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// Export namespace
export const PublicSkeletons = {
  Card: CardSkeleton,
  TournamentCard: TournamentCardSkeleton,
  MatchTheater: MatchTheaterSkeleton,
  Leaderboard: LeaderboardSkeleton,
  PlayerProfile: PlayerProfileSkeleton,
  ClubCard: ClubCardSkeleton,
  StatCard: StatCardSkeleton,
  TournamentJourney: TournamentJourneySkeleton,
};
