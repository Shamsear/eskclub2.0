'use client';

import React, { useState } from 'react';

interface MatchData {
  id: number;
  date: string;
  outcome: 'WIN' | 'DRAW' | 'LOSS';
  goalsScored: number;
  goalsConceded: number;
  pointsEarned: number;
}

interface PerformanceHeatmapProps {
  matches: MatchData[];
}

interface HeatmapCell {
  date: Date;
  performance: number; // 0-100 score
  outcome: 'WIN' | 'DRAW' | 'LOSS';
  goalsScored: number;
  goalsConceded: number;
  pointsEarned: number;
  matchId: number;
}

interface TooltipData {
  cell: HeatmapCell;
  x: number;
  y: number;
}

export default function PerformanceHeatmap({ matches }: PerformanceHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Calculate performance score for each match
  const calculatePerformance = (match: MatchData): number => {
    let score = 0;
    
    // Outcome contribution (0-50 points)
    if (match.outcome === 'WIN') score += 50;
    else if (match.outcome === 'DRAW') score += 25;
    
    // Goal difference contribution (0-30 points)
    const goalDiff = match.goalsScored - match.goalsConceded;
    const normalizedGoalDiff = Math.max(-3, Math.min(3, goalDiff)); // Clamp to -3 to 3
    score += ((normalizedGoalDiff + 3) / 6) * 30;
    
    // Points earned contribution (0-20 points)
    const normalizedPoints = Math.min(match.pointsEarned / 10, 1); // Normalize to 0-1
    score += normalizedPoints * 20;
    
    return Math.round(score);
  };

  // Transform matches into heatmap cells
  const heatmapData: HeatmapCell[] = matches.map((match) => ({
    date: new Date(match.date),
    performance: calculatePerformance(match),
    outcome: match.outcome,
    goalsScored: match.goalsScored,
    goalsConceded: match.goalsConceded,
    pointsEarned: match.pointsEarned,
    matchId: match.id,
  }));

  // Sort by date (oldest first)
  heatmapData.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get color based on performance score
  const getColor = (performance: number): string => {
    if (performance >= 80) return 'bg-green-600';
    if (performance >= 60) return 'bg-green-400';
    if (performance >= 40) return 'bg-yellow-400';
    if (performance >= 20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  // Get color for mobile view based on outcome
  const getOutcomeColor = (outcome: 'WIN' | 'DRAW' | 'LOSS'): string => {
    if (outcome === 'WIN') return 'bg-green-500';
    if (outcome === 'DRAW') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleMouseEnter = (cell: HeatmapCell, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      cell,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No performance data available
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Desktop View - Grid Heatmap */}
      <div className="hidden md:block">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Performance Over Time</h3>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Poor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>Excellent</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-2">
          {heatmapData.map((cell, index) => (
            <div
              key={`${cell.matchId}-${index}`}
              className={`aspect-square rounded ${getColor(cell.performance)} cursor-pointer transition-all hover:scale-110 hover:shadow-lg`}
              onMouseEnter={(e) => handleMouseEnter(cell, e)}
              onMouseLeave={handleMouseLeave}
              aria-label={`Match on ${cell.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}: ${cell.outcome}, Performance ${cell.performance}%`}
            />
          ))}
        </div>
      </div>

      {/* Mobile View - Simplified Bar Chart */}
      <div className="md:hidden">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Performance</h3>
        </div>
        
        <div className="space-y-2">
          {heatmapData.slice(-10).reverse().map((cell, index) => (
            <div
              key={`${cell.matchId}-mobile-${index}`}
              className="flex items-center gap-3"
            >
              <div className="text-xs text-gray-600 w-20 flex-shrink-0">
                {cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full ${getOutcomeColor(cell.outcome)} transition-all`}
                  style={{ width: `${cell.performance}%` }}
                  aria-label={`${cell.outcome}: ${cell.performance}% performance`}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className="text-xs font-medium text-gray-700">
                    {cell.outcome}
                  </span>
                </div>
              </div>
              <div className="text-xs font-medium text-gray-900 w-12 text-right">
                {cell.performance}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="space-y-1">
            <div className="font-semibold border-b border-gray-700 pb-1 mb-1">
              {tooltip.cell.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Outcome:</span>
              <span className={`font-medium ${
                tooltip.cell.outcome === 'WIN' ? 'text-green-400' :
                tooltip.cell.outcome === 'DRAW' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {tooltip.cell.outcome}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Performance:</span>
              <span className="font-medium">{tooltip.cell.performance}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Goals:</span>
              <span className="font-medium">
                {tooltip.cell.goalsScored} - {tooltip.cell.goalsConceded}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Points:</span>
              <span className="font-medium">{tooltip.cell.pointsEarned}</span>
            </div>
          </div>
          {/* Tooltip arrow */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-full"
            style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgb(17, 24, 39)',
            }}
          />
        </div>
      )}
    </div>
  );
}
