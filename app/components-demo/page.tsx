'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  StatCard,
  Badge,
  RoleBadge,
  AchievementBadge,
  StatusBadge,
  PublicCard,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Card3D,
  TournamentCardSkeleton,
  MatchTheaterSkeleton,
  LeaderboardSkeleton,
  PlayerProfileSkeleton,
  ClubCardSkeleton,
  StatCardSkeleton,
  TournamentJourneySkeleton,
  SearchBar,
  HighlightedText,
  FilterPanel,
  EmptyState,
} from '@/components/public';

export default function ComponentsDemoPage() {
  const [showSkeletons, setShowSkeletons] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({});

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Public Sports Platform - Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            Showcasing all shared UI components and design system elements
          </p>
        </div>

        {/* Buttons Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="primary" isLoading>
              Loading...
            </Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>
        </section>

        {/* Badges Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Role Badges</h3>
              <div className="flex flex-wrap gap-2">
                <RoleBadge role="PLAYER" />
                <RoleBadge role="CAPTAIN" />
                <RoleBadge role="MENTOR" />
                <RoleBadge role="MANAGER" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Achievement Badges</h3>
              <div className="flex flex-wrap gap-2">
                <AchievementBadge type="tournament_win" label="Champion" />
                <AchievementBadge type="top_scorer" label="Top Scorer" />
                <AchievementBadge type="most_active" label="Most Active" />
                <AchievementBadge type="custom" label="Custom Award" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Status Badges</h3>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="upcoming" />
                <StatusBadge status="active" />
                <StatusBadge status="completed" />
              </div>
            </div>
          </div>
        </section>

        {/* Stat Cards Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Stat Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total Matches"
              value={156}
              icon="⚽"
              color="primary"
              trend="up"
            />
            <StatCard
              label="Win Rate"
              value={67.5}
              icon="🏆"
              color="success"
              format="percentage"
              trend="up"
            />
            <StatCard
              label="Goals Scored"
              value={342}
              icon="⚡"
              color="warning"
              trend="neutral"
            />
            <StatCard
              label="Average Points"
              value={2.45}
              icon="📊"
              color="neutral"
              format="decimal"
              trend="down"
            />
          </div>
        </section>

        {/* Cards Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PublicCard variant="default" hover>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  This is a default card with hover effects.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">
                  View Details
                </Button>
              </CardFooter>
            </PublicCard>

            <PublicCard variant="elevated" hover>
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  This card has elevated shadow styling.
                </p>
              </CardContent>
            </PublicCard>

            <PublicCard variant="glass" hover>
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  This card has glassmorphism effects.
                </p>
              </CardContent>
            </PublicCard>
          </div>
        </section>

        {/* 3D Cards Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3D Cards (Hover to interact)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card3D key={i}>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-2xl">
                      🏆
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Club Name {i}</h3>
                      <p className="text-sm text-gray-600">Est. 2020</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    A competitive sports club with amazing achievements.
                  </p>
                  <div className="flex gap-2">
                    <AchievementBadge type="tournament_win" label="5x Champion" />
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        </section>

        {/* Search and Filter Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Search & Filter System
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ✨ New Feature: Comprehensive Search & Filter System
            </h3>
            <p className="text-blue-800 mb-4">
              A complete search and filtering solution with debounced search, text highlighting, 
              AND filter logic, and contextual empty states.
            </p>
            <Link href="/tournaments">
              <Button variant="primary">
                View Live Example (Tournaments Page)
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Search Bar with Debouncing</h3>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Try typing to see debounced search..."
              />
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-600">
                  Search query: <strong>{searchQuery}</strong>
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Text Highlighting</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-gray-900">
                  <HighlightedText 
                    text="The quick brown fox jumps over the lazy dog" 
                    highlight={searchQuery || 'fox'} 
                  />
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Filter Panel</h3>
              <div className="max-w-sm">
                <FilterPanel
                  filters={filters}
                  onFilterChange={setFilters}
                  filterSections={[
                    {
                      id: 'status',
                      title: 'Status',
                      type: 'checkbox',
                      options: [
                        { value: 'active', label: 'Active', count: 10 },
                        { value: 'pending', label: 'Pending', count: 5 },
                        { value: 'completed', label: 'Completed', count: 15 },
                      ],
                    },
                    {
                      id: 'priority',
                      title: 'Priority',
                      type: 'radio',
                      options: [
                        { value: 'high', label: 'High' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'low', label: 'Low' },
                      ],
                    },
                  ]}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Empty States</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EmptyState
                  title="No results found"
                  description="We couldn't find any items matching your criteria"
                  action={{
                    label: 'Clear Filters',
                    onClick: () => alert('Filters cleared!'),
                  }}
                  suggestions={[
                    'Check your spelling',
                    'Try more general keywords',
                    'Use fewer filters',
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Skeleton Loaders Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Skeleton Loaders
          </h2>
          <div className="flex gap-4 mb-6">
            <Button
              variant={showSkeletons ? 'secondary' : 'primary'}
              onClick={() => setShowSkeletons(!showSkeletons)}
            >
              {showSkeletons ? 'Hide' : 'Show'} Skeletons
            </Button>
          </div>

          {showSkeletons && (
            <div className="space-y-12">
              <div>
                <h3 className="text-lg font-semibold mb-4">Stat Card Skeleton</h3>
                <StatCardSkeleton count={4} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Tournament Card Skeleton</h3>
                <TournamentCardSkeleton count={3} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Club Card Skeleton</h3>
                <ClubCardSkeleton count={3} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Leaderboard Skeleton</h3>
                <LeaderboardSkeleton count={5} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Tournament Journey Skeleton</h3>
                <TournamentJourneySkeleton />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Match Theater Skeleton</h3>
                <MatchTheaterSkeleton />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Player Profile Skeleton</h3>
                <PlayerProfileSkeleton />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
