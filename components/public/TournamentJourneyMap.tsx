'use client';

import { useState } from 'react';
import { PublicCard, CardContent } from './PublicCard';

interface Stage {
  id: number;
  name: string;
  order: number;
  matchCount: number;
}

interface TournamentJourneyMapProps {
  stages: Stage[];
  tournamentId: number;
}

export default function TournamentJourneyMap({
  stages,
  tournamentId,
}: TournamentJourneyMapProps) {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  // Sort stages by order to ensure chronological display
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  const handleStageClick = (stageId: number) => {
    setSelectedStage(stageId === selectedStage ? null : stageId);
  };

  return (
    <div className="space-y-6">
      {/* Desktop: Horizontal Timeline */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-600" />

          {/* Stage Cards */}
          <div className="relative flex justify-between items-start gap-4">
            {sortedStages.map((stage, index) => {
              const isHovered = hoveredStage === stage.id;
              const isSelected = selectedStage === stage.id;
              const isActive = isHovered || isSelected;

              return (
                <div
                  key={stage.id}
                  className="flex-1 flex flex-col items-center"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Stage Number Circle */}
                  <div
                    className={`
                      relative z-10 w-24 h-24 rounded-full border-4 
                      flex items-center justify-center
                      transition-all duration-300 cursor-pointer
                      ${
                        isActive
                          ? 'bg-primary-600 border-primary-700 shadow-xl scale-110'
                          : 'bg-white border-primary-400 shadow-lg hover:scale-105'
                      }
                    `}
                    onMouseEnter={() => setHoveredStage(stage.id)}
                    onMouseLeave={() => setHoveredStage(null)}
                    onClick={() => handleStageClick(stage.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Stage ${stage.order}: ${stage.name}`}
                    aria-pressed={isSelected}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStageClick(stage.id);
                      }
                    }}
                  >
                    <div className="text-center">
                      <div
                        className={`
                          text-2xl font-bold transition-colors
                          ${isActive ? 'text-white' : 'text-primary-600'}
                        `}
                      >
                        {stage.order}
                      </div>
                      <div
                        className={`
                          text-xs font-medium transition-colors
                          ${isActive ? 'text-primary-100' : 'text-primary-500'}
                        `}
                      >
                        Stage
                      </div>
                    </div>
                  </div>

                  {/* Stage Info Card */}
                  <div
                    className={`
                      mt-6 w-full transition-all duration-300
                      ${isActive ? 'opacity-100 translate-y-0' : 'opacity-90'}
                    `}
                  >
                    <PublicCard
                      className={`
                        transition-all duration-300
                        ${
                          isActive
                            ? 'border-primary-400 shadow-lg'
                            : 'border-gray-200 hover:border-primary-300'
                        }
                      `}
                      padding="md"
                    >
                      <CardContent>
                        <h3
                          className={`
                            font-bold text-center mb-2 transition-colors
                            ${isActive ? 'text-primary-700' : 'text-gray-900'}
                          `}
                        >
                          {stage.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span>{stage.matchCount} matches</span>
                        </div>
                      </CardContent>
                    </PublicCard>
                  </div>

                  {/* Connector Arrow (except for last stage) */}
                  {index < sortedStages.length - 1 && (
                    <div className="absolute top-12 left-1/2 w-full flex items-center justify-center pointer-events-none">
                      <svg
                        className="w-8 h-8 text-primary-500 opacity-50"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        style={{ marginLeft: '50%' }}
                      >
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: Vertical Timeline */}
      <div className="md:hidden space-y-4">
        {sortedStages.map((stage, index) => {
          const isSelected = selectedStage === stage.id;

          return (
            <div
              key={stage.id}
              className="relative"
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Vertical Line */}
              {index < sortedStages.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-200 -mb-4" />
              )}

              <div className="flex gap-4">
                {/* Stage Number Circle */}
                <div
                  className={`
                    relative z-10 w-12 h-12 rounded-full border-4 flex-shrink-0
                    flex items-center justify-center
                    transition-all duration-300 cursor-pointer
                    ${
                      isSelected
                        ? 'bg-primary-600 border-primary-700 shadow-lg'
                        : 'bg-white border-primary-400 shadow-md'
                    }
                  `}
                  onClick={() => handleStageClick(stage.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Stage ${stage.order}: ${stage.name}`}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStageClick(stage.id);
                    }
                  }}
                >
                  <span
                    className={`
                      text-lg font-bold transition-colors
                      ${isSelected ? 'text-white' : 'text-primary-600'}
                    `}
                  >
                    {stage.order}
                  </span>
                </div>

                {/* Stage Info Card */}
                <div className="flex-1">
                  <PublicCard
                    className={`
                      transition-all duration-300
                      ${
                        isSelected
                          ? 'border-primary-400 shadow-lg'
                          : 'border-gray-200'
                      }
                    `}
                    padding="md"
                  >
                    <CardContent>
                      <h3
                        className={`
                          font-bold mb-2 transition-colors
                          ${isSelected ? 'text-primary-700' : 'text-gray-900'}
                        `}
                      >
                        {stage.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <span>{stage.matchCount} matches</span>
                      </div>
                    </CardContent>
                  </PublicCard>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
