'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ErrorMessage } from './FormError';
import { useToast } from './ui/Toast';

// Match outcome enum
type MatchOutcome = 'WIN' | 'DRAW' | 'LOSS';

// Validation schema for a single match result
const matchResultSchema = z.object({
  playerId: z.number().int().positive("Player must be selected"),
  outcome: z.enum(['WIN', 'DRAW', 'LOSS'], {
    errorMap: () => ({ message: "Outcome must be selected" }),
  }),
  goalsScored: z.number().int().min(0, "Goals scored must be non-negative"),
  goalsConceded: z.number().int().min(0, "Goals conceded must be non-negative"),
});

// Validation schema for the entire match
const matchSchema = z.object({
  matchDate: z.string().min(1, "Match date is required").refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  results: z.array(matchResultSchema).min(1, "At least one player result is required"),
}).refine((data) => {
  // Check for duplicate player IDs
  const playerIds = data.results.map(r => r.playerId);
  const uniquePlayerIds = new Set(playerIds);
  return playerIds.length === uniquePlayerIds.size;
}, {
  message: "Duplicate players are not allowed in match results",
  path: ["results"],
});

interface Participant {
  id: number;
  name: string;
  photo?: string | null;
  clubId?: number | null;
}

interface PlayerResult {
  playerId: number;
  outcome: MatchOutcome | '';
  goalsScored: number;
  goalsConceded: number;
}

interface MatchScore {
  playerAId: number;
  playerBId: number;
  playerAGoals: number;
  playerBGoals: number;
}

interface MatchResultFormProps {
  tournamentId: number | string;
  clubId?: number | string;
  matchId?: number | string;
  matchFormat?: 'SINGLES' | 'DOUBLES';
  participants?: Participant[];
  initialData?: {
    id?: number;
    matchDate: string;
    stageId?: number | null;
    stageName?: string | null;
    walkoverWinnerId?: number | null;
    results: Array<{
      id?: number;
      playerId: number;
      outcome: MatchOutcome | string;
      goalsScored: number;
      goalsConceded: number;
      pointsEarned?: number;
      player?: {
        id: number;
        name: string;
        email?: string;
        photo?: string | null;
      };
    }>;
  };
  pointSystem?: {
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    pointsPerGoalScored: number;
    pointsPerGoalConceded: number;
    pointsForWalkoverWin?: number;
    pointsForWalkoverLoss?: number;
  };
  mode?: 'create' | 'edit';
}

interface FormErrors {
  matchDate?: string;
  results?: string;
  submit?: string;
  [key: string]: string | undefined;
}

export function MatchResultForm({ 
  tournamentId, 
  clubId,
  matchId,
  matchFormat = 'SINGLES',
  participants: participantsProp, 
  initialData, 
  pointSystem,
  mode: modeProp 
}: MatchResultFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingParticipants, setIsFetchingParticipants] = useState(!participantsProp);
  const [participants, setParticipants] = useState<Participant[]>(participantsProp || []);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Stage selection state
  const [stages, setStages] = useState<Array<{id: number; name: string; order: number}>>([]);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(initialData?.stageId || null);
  const [isFetchingStages, setIsFetchingStages] = useState(true);
  
  // Determine mode from props or initial data
  const mode = modeProp || (initialData || matchId ? 'edit' : 'create');
  
  // Initialize form data
  const [matchDate, setMatchDate] = useState(
    initialData?.matchDate ? initialData.matchDate.split('T')[0] : ''
  );
  
  // Walkover state: null = normal match, 0 = both forfeit, playerId = that player won by walkover
  const [walkoverWinnerId, setWalkoverWinnerId] = useState<number | null>(
    initialData?.walkoverWinnerId !== undefined ? initialData.walkoverWinnerId : null
  );
  
  // Point override state
  const [showPointOverride, setShowPointOverride] = useState(false);
  const [pointOverrides, setPointOverrides] = useState<{
    [playerIndex: number]: {
      enabled: boolean;
      customPoints: number;
      extraPoints: number;
      components: {
        outcomePoints: { enabled: boolean; value: number };
        goalScoredPoints: { enabled: boolean; value: number };
        goalConcededPoints: { enabled: boolean; value: number };
      };
    };
  }>({});
  
  const [playerResults, setPlayerResults] = useState<PlayerResult[]>(
    initialData?.results.length 
      ? initialData.results.map(r => ({
          playerId: r.playerId,
          outcome: r.outcome as MatchOutcome,
          goalsScored: r.goalsScored,
          goalsConceded: r.goalsConceded,
        }))
      : matchFormat === 'DOUBLES'
        ? [
            { playerId: 0, outcome: '', goalsScored: 0, goalsConceded: 0 },
            { playerId: 0, outcome: '', goalsScored: 0, goalsConceded: 0 },
            { playerId: 0, outcome: '', goalsScored: 0, goalsConceded: 0 },
            { playerId: 0, outcome: '', goalsScored: 0, goalsConceded: 0 }
          ]
        : [
            { playerId: 0, outcome: '', goalsScored: 0, goalsConceded: 0 },
            { playerId: 0, outcome: '', goalsScored: 0, goalsConceded: 0 }
          ]
  );

  // Debug logging for participants
  useEffect(() => {
    console.log('=== Participants Data ===');
    console.log('Match Format:', matchFormat);
    console.log('Participants:', participants);
    console.log('Sample participant:', participants[0]);
  }, [participants, matchFormat]);

  // Fetch participants if not provided
  useEffect(() => {
    if (!participantsProp) {
      const fetchParticipants = async () => {
        try {
          const response = await fetch(`/api/tournaments/${tournamentId}/participants`);
          if (response.ok) {
            const data = await response.json();
            // Transform the response to match our Participant interface
            const transformedParticipants = data.map((p: any) => ({
              id: p.player?.id || p.playerId,
              name: p.player?.name || p.name,
              photo: p.player?.photo || p.photo,
              clubId: p.player?.clubId || p.clubId,
            }));
            setParticipants(transformedParticipants);
          } else {
            console.error('Failed to fetch participants: HTTP', response.status);
            showToast('Failed to load participants. Please refresh the page.', 'error');
          }
        } catch (error) {
          console.error('Failed to fetch participants:', error);
          showToast('Network error loading participants. Please check your connection.', 'error');
        } finally {
          setIsFetchingParticipants(false);
        }
      };
      fetchParticipants();
    }
  }, [participantsProp, tournamentId, showToast]);

  // Fetch tournament stages
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await fetch(`/api/tournaments/${tournamentId}/stages`);
        if (response.ok) {
          const data = await response.json();
          setStages(data.stages || []);
        }
      } catch (error) {
        console.error('Failed to fetch stages:', error);
      } finally {
        setIsFetchingStages(false);
      }
    };
    fetchStages();
  }, [tournamentId]);

  // Validate walkover selection when players change
  useEffect(() => {
    if (walkoverWinnerId !== null && walkoverWinnerId !== 0) {
      // Check if the selected walkover winner is still in the player results
      const isValidWalkover = playerResults.some(r => r.playerId === walkoverWinnerId);
      if (!isValidWalkover) {
        // Reset walkover if the selected player is no longer in the match
        setWalkoverWinnerId(null);
      }
    }
  }, [playerResults, walkoverWinnerId]);

  // Handle walkover changes - auto-set outcomes and reset goals
  useEffect(() => {
    if (walkoverWinnerId !== null && playerResults.length === 2 && pointSystem) {
      const newResults = [...playerResults];
      const newOverrides = { ...pointOverrides };
      
      const walkoverWinPoints = pointSystem.pointsForWalkoverWin ?? 3;
      const walkoverLossPoints = pointSystem.pointsForWalkoverLoss ?? -3;
      
      if (walkoverWinnerId === 0) {
        // Both forfeited - no points
        newResults[0] = { ...newResults[0], outcome: 'LOSS', goalsScored: 0, goalsConceded: 0 };
        newResults[1] = { ...newResults[1], outcome: 'LOSS', goalsScored: 0, goalsConceded: 0 };
        
        // Set custom points to 0 for both
        newOverrides[0] = {
          enabled: true,
          customPoints: 0,
          extraPoints: 0,
          components: {
            outcomePoints: { enabled: false, value: 0 },
            goalScoredPoints: { enabled: false, value: 0 },
            goalConcededPoints: { enabled: false, value: 0 },
          },
        };
        newOverrides[1] = {
          enabled: true,
          customPoints: 0,
          extraPoints: 0,
          components: {
            outcomePoints: { enabled: false, value: 0 },
            goalScoredPoints: { enabled: false, value: 0 },
            goalConcededPoints: { enabled: false, value: 0 },
          },
        };
      } else {
        // One player won by walkover
        const winnerIndex = newResults.findIndex(r => r.playerId === walkoverWinnerId);
        const loserIndex = winnerIndex === 0 ? 1 : 0;
        
        if (winnerIndex !== -1) {
          newResults[winnerIndex] = { ...newResults[winnerIndex], outcome: 'WIN', goalsScored: 0, goalsConceded: 0 };
          newResults[loserIndex] = { ...newResults[loserIndex], outcome: 'LOSS', goalsScored: 0, goalsConceded: 0 };
          
          // Set walkover points
          newOverrides[winnerIndex] = {
            enabled: true,
            customPoints: walkoverWinPoints,
            extraPoints: 0,
            components: {
              outcomePoints: { enabled: true, value: walkoverWinPoints },
              goalScoredPoints: { enabled: false, value: 0 },
              goalConcededPoints: { enabled: false, value: 0 },
            },
          };
          newOverrides[loserIndex] = {
            enabled: true,
            customPoints: walkoverLossPoints,
            extraPoints: 0,
            components: {
              outcomePoints: { enabled: true, value: walkoverLossPoints },
              goalScoredPoints: { enabled: false, value: 0 },
              goalConcededPoints: { enabled: false, value: 0 },
            },
          };
        }
      }
      
      setPlayerResults(newResults);
      setPointOverrides(newOverrides);
    }
  }, [walkoverWinnerId, pointSystem]);

  // Add a new player result entry
  const addPlayerResult = () => {
    setPlayerResults([...playerResults, { playerId: 0, outcome: '', goalsScored: 0, goalsConceded: 0 }]);
  };

  // Remove a player result entry
  const removePlayerResult = (index: number) => {
    if (playerResults.length > 1) {
      const newResults = playerResults.filter((_, i) => i !== index);
      setPlayerResults(newResults);
      // Clear any errors related to this result
      const newErrors = { ...errors };
      delete newErrors[`results.${index}.playerId`];
      delete newErrors[`results.${index}.outcome`];
      delete newErrors[`results.${index}.goalsScored`];
      delete newErrors[`results.${index}.goalsConceded`];
      setErrors(newErrors);
    }
  };

  // Update a specific player result field
  const updatePlayerResult = (index: number, field: keyof PlayerResult, value: any) => {
    console.log('updatePlayerResult called:', { index, field, value });
    console.log('Current playerResults:', playerResults);
    console.log('matchFormat:', matchFormat);
    
    const newResults = [...playerResults];
    newResults[index] = { ...newResults[index], [field]: value };
    
    console.log('After update, newResults[index]:', newResults[index]);
    
    // Auto-calculate for doubles matches (4 players)
    if (matchFormat === 'DOUBLES' && playerResults.length === 4 && walkoverWinnerId === null) {
      // Team A: players 0 and 1, Team B: players 2 and 3
      if (field === 'goalsScored') {
        if (index === 0 || index === 1) {
          // Team A scored, update Team B's conceded
          newResults[2] = { ...newResults[2], goalsConceded: value };
          newResults[3] = { ...newResults[3], goalsConceded: value };
        } else {
          // Team B scored, update Team A's conceded
          newResults[0] = { ...newResults[0], goalsConceded: value };
          newResults[1] = { ...newResults[1], goalsConceded: value };
        }
      }
      
      // Auto-calculate outcomes based on team goals
      const teamAGoals = newResults[0].goalsScored;
      const teamBGoals = newResults[2].goalsScored;
      
      if (teamAGoals !== undefined && teamBGoals !== undefined) {
        if (teamAGoals > teamBGoals) {
          newResults[0].outcome = 'WIN';
          newResults[1].outcome = 'WIN';
          newResults[2].outcome = 'LOSS';
          newResults[3].outcome = 'LOSS';
        } else if (teamAGoals < teamBGoals) {
          newResults[0].outcome = 'LOSS';
          newResults[1].outcome = 'LOSS';
          newResults[2].outcome = 'WIN';
          newResults[3].outcome = 'WIN';
        } else {
          newResults[0].outcome = 'DRAW';
          newResults[1].outcome = 'DRAW';
          newResults[2].outcome = 'DRAW';
          newResults[3].outcome = 'DRAW';
        }
      }
    }
    // Auto-calculate for singles matches (2 players)
    else if (playerResults.length === 2 && walkoverWinnerId === null) {
      const otherIndex = index === 0 ? 1 : 0;
      
      // If updating goals scored, update opponent's goals conceded
      if (field === 'goalsScored') {
        newResults[otherIndex] = { ...newResults[otherIndex], goalsConceded: value };
      }
      
      // Auto-calculate outcomes based on goals
      if (newResults[0].goalsScored !== undefined && newResults[1].goalsScored !== undefined) {
        if (newResults[0].goalsScored > newResults[1].goalsScored) {
          newResults[0].outcome = 'WIN';
          newResults[1].outcome = 'LOSS';
        } else if (newResults[0].goalsScored < newResults[1].goalsScored) {
          newResults[0].outcome = 'LOSS';
          newResults[1].outcome = 'WIN';
        } else {
          newResults[0].outcome = 'DRAW';
          newResults[1].outcome = 'DRAW';
        }
      }
    }
    
    console.log('Final newResults:', newResults);
    setPlayerResults(newResults);
    
    // Clear error for this field
    const errorKey = `results.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: undefined });
    }
  };

  const validateForm = (): boolean => {
    try {
      // Convert empty outcome strings to undefined for validation
      const resultsToValidate = playerResults.map(r => ({
        ...r,
        outcome: r.outcome || undefined,
      }));
      
      matchSchema.parse({
        matchDate,
        results: resultsToValidate,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const url = mode === 'create' 
        ? `/api/tournaments/${tournamentId}/matches`
        : `/api/matches/${matchId || initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchDate: new Date(matchDate).toISOString(),
          stageId: selectedStageId,
          stageName: selectedStageId ? stages.find(s => s.id === selectedStageId)?.name : null,
          walkoverWinnerId: walkoverWinnerId,
          results: playerResults.map((r, idx) => ({
            playerId: r.playerId,
            outcome: r.outcome,
            goalsScored: r.goalsScored,
            goalsConceded: r.goalsConceded,
            ...(pointOverrides[idx]?.enabled && {
              customPoints: pointOverrides[idx].customPoints,
            }),
          })),
        }),
      });

      console.log('=== Match Submission Data ===');
      console.log('Match Format:', matchFormat);
      console.log('Player Results:', playerResults);
      console.log('Number of players:', playerResults.length);
      console.log('Is Team Match:', matchFormat === 'DOUBLES');
      console.log('Request Body:', JSON.stringify({
        matchDate: new Date(matchDate).toISOString(),
        stageId: selectedStageId,
        stageName: selectedStageId ? stages.find(s => s.id === selectedStageId)?.name : null,
        walkoverWinnerId: walkoverWinnerId,
        results: playerResults.map((r, idx) => ({
          playerId: r.playerId,
          outcome: r.outcome,
          goalsScored: r.goalsScored,
          goalsConceded: r.goalsConceded,
          ...(pointOverrides[idx]?.enabled && {
            customPoints: pointOverrides[idx].customPoints,
          }),
        })),
      }, null, 2));

      const data = await response.json();
      
      console.log('=== API Response ===');
      console.log('Status:', response.status);
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('=== API Error ===');
        console.error('Error details:', data);
        if (data.details) {
          setErrors(data.details);
        } else {
          setErrors({ submit: data.error || 'An error occurred' });
        }
        showToast(data.error || 'Failed to save match result', 'error');
        return;
      }

      // Success
      showToast(
        mode === 'create' ? 'Match result added successfully' : 'Match result updated successfully',
        'success'
      );
      
      // Redirect based on whether this is a club-specific tournament
      if (clubId) {
        router.push(`/dashboard/clubs/${clubId}/tournaments/${tournamentId}`);
      } else {
        router.push(`/dashboard/tournaments/${tournamentId}`);
      }
      router.refresh();
    } catch (error) {
      // Handle network errors specifically
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
      showToast(errorMessage, 'error');
      console.error('Match result form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (clubId) {
      router.push(`/dashboard/clubs/${clubId}/tournaments/${tournamentId}`);
    } else {
      router.push(`/dashboard/tournaments/${tournamentId}`);
    }
  };

  // Get available players for a specific result index (exclude already selected players)
  const getAvailablePlayers = (currentIndex: number): Participant[] => {
    const selectedPlayerIds = playerResults
      .map((r, i) => i !== currentIndex ? r.playerId : 0)
      .filter(id => id > 0);
    
    let availablePlayers = participants.filter(p => !selectedPlayerIds.includes(p.id));
    
    // For doubles matches, apply team-based filtering
    if (matchFormat === 'DOUBLES' && playerResults.length === 4) {
      // Determine which team this player belongs to
      // Team A: indices 0, 1
      // Team B: indices 2, 3
      const isTeamA = currentIndex === 0 || currentIndex === 1;
      const teamMateIndex = isTeamA ? (currentIndex === 0 ? 1 : 0) : (currentIndex === 2 ? 3 : 2);
      const teamMatePlayerId = playerResults[teamMateIndex]?.playerId;
      
      console.log('=== Player Filtering Debug ===');
      console.log('Current Index:', currentIndex);
      console.log('Team:', isTeamA ? 'A' : 'B');
      console.log('Teammate Index:', teamMateIndex);
      console.log('Teammate Player ID:', teamMatePlayerId);
      
      // If teammate is selected, filter by their club
      if (teamMatePlayerId && teamMatePlayerId > 0) {
        const teamMate = participants.find(p => p.id === teamMatePlayerId);
        console.log('Teammate found:', teamMate);
        
        if (teamMate) {
          const teamMateClubId = teamMate.clubId;
          console.log('Teammate Club ID:', teamMateClubId);
          
          if (teamMateClubId) {
            // Teammate has a club - only show players from same club
            console.log('Filtering to same club:', teamMateClubId);
            availablePlayers = availablePlayers.filter(p => p.clubId === teamMateClubId);
          } else {
            // Teammate is a free agent - only show free agents
            console.log('Filtering to free agents only');
            availablePlayers = availablePlayers.filter(p => !p.clubId);
          }
          console.log('Available players after filtering:', availablePlayers.length);
        }
      }
    }
    
    return availablePlayers;
  };

  // Calculate points for a player result
  const calculatePlayerPoints = (result: PlayerResult, playerIndex?: number): number => {
    if (!pointSystem || !result.outcome) return 0;
    
    // Check if this is a walkover match
    if (walkoverWinnerId !== null) {
      if (walkoverWinnerId === 0) {
        // Both forfeited - no points
        return 0;
      } else if (walkoverWinnerId === result.playerId) {
        // Winner by walkover
        return pointSystem.pointsForWalkoverWin ?? 3;
      } else {
        // Loser by walkover
        return pointSystem.pointsForWalkoverLoss ?? -3;
      }
    }
    
    // Normal match calculation
    let points = 0;
    
    // Outcome points
    if (result.outcome === 'WIN') points += pointSystem.pointsPerWin;
    else if (result.outcome === 'DRAW') points += pointSystem.pointsPerDraw;
    else if (result.outcome === 'LOSS') points += pointSystem.pointsPerLoss;
    
    // Goal points
    points += result.goalsScored * pointSystem.pointsPerGoalScored;
    points += result.goalsConceded * pointSystem.pointsPerGoalConceded;
    
    return points;
  };

  if (isFetchingParticipants) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading participants...</p>
        </div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 text-lg">No participants available</p>
        <p className="text-gray-500 text-sm mt-2">
          Please add participants to the tournament before creating match results.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Match result form">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="match-date" className="block text-sm font-medium text-gray-700">
            Match Date *
          </label>
          <button
            type="button"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setMatchDate(today);
              if (errors.matchDate) {
                setErrors({ ...errors, matchDate: undefined });
              }
            }}
            className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Today
          </button>
        </div>
        <input
          id="match-date"
          type="date"
          value={matchDate}
          onChange={(e) => {
            setMatchDate(e.target.value);
            if (errors.matchDate) {
              setErrors({ ...errors, matchDate: undefined });
            }
          }}
          className={`block w-full px-3 py-2.5 min-h-[44px] border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors text-gray-900 bg-white ${
            errors.matchDate
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
          }`}
          required
        />
        {errors.matchDate && (
          <p className="mt-1 text-sm text-red-600">{errors.matchDate}</p>
        )}
      </div>

      {/* Walkover Selection */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <label htmlFor="walkover-select" className="block text-sm font-bold text-gray-900">
              Walkover / Forfeit
            </label>
            <p className="text-xs text-gray-600 mt-0.5">Select if a player didn&apos;t show up or both forfeited</p>
          </div>
        </div>
        <select
          id="walkover-select"
          value={walkoverWinnerId === null ? '' : walkoverWinnerId.toString()}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              setWalkoverWinnerId(null);
            } else if (value === '0') {
              setWalkoverWinnerId(0);
            } else {
              setWalkoverWinnerId(parseInt(value));
            }
          }}
          disabled={playerResults.filter(r => r.playerId > 0).length < 2}
          className="block w-full px-3 py-2.5 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Normal Match (no walkover)</option>
          <option value="0">Both Players Forfeited (no points awarded)</option>
          {playerResults.map((result, index) => 
            result.playerId > 0 && (
              <option key={`player-${result.playerId}-${index}`} value={result.playerId}>
                {participants.find(p => p.id === result.playerId)?.name || `Player ${index + 1}`} Won by Walkover
              </option>
            )
          )}
        </select>
        {playerResults.filter(r => r.playerId > 0).length < 2 && (
          <p className="mt-2 text-sm text-orange-600">
            ⚠️ Please select both players before choosing a walkover option
          </p>
        )}
        {walkoverWinnerId !== null && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 font-medium">
              {walkoverWinnerId === 0 
                ? '⚠️ Both players forfeited - no points will be awarded'
                : `✓ ${participants.find(p => p.id === walkoverWinnerId)?.name} wins by walkover`
              }
            </p>
          </div>
        )}
      </div>

      {/* Tournament Stage Selection */}
      {stages.length > 0 && (
        <div>
          <label htmlFor="stage-select" className="block text-sm font-medium text-gray-700 mb-2">
            Tournament Stage <span className="text-gray-400">(Optional)</span>
          </label>
          <select
            id="stage-select"
            value={selectedStageId || ''}
            onChange={(e) => setSelectedStageId(e.target.value ? parseInt(e.target.value) : null)}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
          >
            <option value="">No specific stage (use default points)</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Select a stage to use stage-specific point calculations
          </p>
        </div>
      )}

      <div className="border-t-2 border-gray-200 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 id="player-results-heading" className="text-lg font-bold text-gray-900">
              {matchFormat === 'DOUBLES' ? 'Team Results' : 'Player Results'}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {matchFormat === 'DOUBLES' 
                ? 'Record the match result between two teams (2v2)'
                : 'Record the match result between two players (1v1)'}
            </p>
          </div>
        </div>

        {errors.results && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3" role="alert">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{errors.results}</p>
          </div>
        )}

        <div className="space-y-6" role="list" aria-labelledby="player-results-heading">
          {matchFormat === 'DOUBLES' ? (
            // Doubles format - show 2 teams of 2 players each
            <>
              {/* Team A */}
              <div className="p-6 border-2 rounded-xl shadow-md border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Team A</h4>
                </div>
                
                <div className="space-y-4">
                  {/* Player 1 */}
                  <div>
                    <label htmlFor="player-0" className="block text-sm font-medium text-gray-700 mb-1">
                      Player 1 *
                    </label>
                    <select
                      id="player-0"
                      value={playerResults[0]?.playerId || 0}
                      onChange={(e) => updatePlayerResult(0, 'playerId', parseInt(e.target.value))}
                      disabled={walkoverWinnerId !== null}
                      className="block w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="0">Select a player</option>
                      {getAvailablePlayers(0).map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Player 2 */}
                  <div>
                    <label htmlFor="player-1" className="block text-sm font-medium text-gray-700 mb-1">
                      Player 2 *
                    </label>
                    <select
                      id="player-1"
                      value={playerResults[1]?.playerId || 0}
                      onChange={(e) => updatePlayerResult(1, 'playerId', parseInt(e.target.value))}
                      disabled={walkoverWinnerId !== null}
                      className="block w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="0">Select a player</option>
                      {getAvailablePlayers(1).map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Team A Goals */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label htmlFor="team-a-goals" className="block text-sm font-medium text-gray-700 mb-1">
                        Goals Scored *
                      </label>
                      <input
                        id="team-a-goals"
                        type="number"
                        min="0"
                        value={playerResults[0]?.goalsScored ?? 0}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          if (!isNaN(value)) {
                            // Update both Team A players at once
                            const newResults = [...playerResults];
                            newResults[0] = { ...newResults[0], goalsScored: value };
                            newResults[1] = { ...newResults[1], goalsScored: value };
                            
                            // Update Team B's goals conceded
                            newResults[2] = { ...newResults[2], goalsConceded: value };
                            newResults[3] = { ...newResults[3], goalsConceded: value };
                            
                            // Auto-calculate outcomes
                            const teamBGoals = newResults[2].goalsScored;
                            if (value > teamBGoals) {
                              newResults[0].outcome = 'WIN';
                              newResults[1].outcome = 'WIN';
                              newResults[2].outcome = 'LOSS';
                              newResults[3].outcome = 'LOSS';
                            } else if (value < teamBGoals) {
                              newResults[0].outcome = 'LOSS';
                              newResults[1].outcome = 'LOSS';
                              newResults[2].outcome = 'WIN';
                              newResults[3].outcome = 'WIN';
                            } else {
                              newResults[0].outcome = 'DRAW';
                              newResults[1].outcome = 'DRAW';
                              newResults[2].outcome = 'DRAW';
                              newResults[3].outcome = 'DRAW';
                            }
                            
                            setPlayerResults(newResults);
                          }
                        }}
                        disabled={walkoverWinnerId !== null}
                        className="block w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Goals Conceded
                      </label>
                      <div className="px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-md bg-gray-50 text-gray-600 flex items-center">
                        {playerResults[0]?.goalsConceded || 0}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Auto-calculated from opponent's goals</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="flex-1 border-t-2 border-gray-300"></div>
                <div className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                  <span className="text-lg font-bold text-white">VS</span>
                </div>
                <div className="flex-1 border-t-2 border-gray-300"></div>
              </div>

              {/* Team B */}
              <div className="p-6 border-2 rounded-xl shadow-md border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Team B</h4>
                </div>
                
                <div className="space-y-4">
                  {/* Player 3 */}
                  <div>
                    <label htmlFor="player-2" className="block text-sm font-medium text-gray-700 mb-1">
                      Player 1 *
                    </label>
                    <select
                      id="player-2"
                      value={playerResults[2]?.playerId || 0}
                      onChange={(e) => updatePlayerResult(2, 'playerId', parseInt(e.target.value))}
                      disabled={walkoverWinnerId !== null}
                      className="block w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="0">Select a player</option>
                      {getAvailablePlayers(2).map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Player 4 */}
                  <div>
                    <label htmlFor="player-3" className="block text-sm font-medium text-gray-700 mb-1">
                      Player 2 *
                    </label>
                    <select
                      id="player-3"
                      value={playerResults[3]?.playerId || 0}
                      onChange={(e) => updatePlayerResult(3, 'playerId', parseInt(e.target.value))}
                      disabled={walkoverWinnerId !== null}
                      className="block w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="0">Select a player</option>
                      {getAvailablePlayers(3).map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Team B Goals */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label htmlFor="team-b-goals" className="block text-sm font-medium text-gray-700 mb-1">
                        Goals Scored *
                      </label>
                      <input
                        id="team-b-goals"
                        type="number"
                        min="0"
                        value={playerResults[2]?.goalsScored ?? 0}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          if (!isNaN(value)) {
                            // Update both Team B players at once
                            const newResults = [...playerResults];
                            newResults[2] = { ...newResults[2], goalsScored: value };
                            newResults[3] = { ...newResults[3], goalsScored: value };
                            
                            // Update Team A's goals conceded
                            newResults[0] = { ...newResults[0], goalsConceded: value };
                            newResults[1] = { ...newResults[1], goalsConceded: value };
                            
                            // Auto-calculate outcomes
                            const teamAGoals = newResults[0].goalsScored;
                            if (teamAGoals > value) {
                              newResults[0].outcome = 'WIN';
                              newResults[1].outcome = 'WIN';
                              newResults[2].outcome = 'LOSS';
                              newResults[3].outcome = 'LOSS';
                            } else if (teamAGoals < value) {
                              newResults[0].outcome = 'LOSS';
                              newResults[1].outcome = 'LOSS';
                              newResults[2].outcome = 'WIN';
                              newResults[3].outcome = 'WIN';
                            } else {
                              newResults[0].outcome = 'DRAW';
                              newResults[1].outcome = 'DRAW';
                              newResults[2].outcome = 'DRAW';
                              newResults[3].outcome = 'DRAW';
                            }
                            
                            setPlayerResults(newResults);
                          }
                        }}
                        disabled={walkoverWinnerId !== null}
                        className="block w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Goals Conceded
                      </label>
                      <div className="px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-md bg-gray-50 text-gray-600 flex items-center">
                        {playerResults[2]?.goalsConceded || 0}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Auto-calculated from opponent's goals</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Singles format - show 2 individual players
            playerResults.slice(0, 2).map((result, index) => {
            const availablePlayers = getAvailablePlayers(index);
            
            return (
              <div key={index}>
                {index === 1 && (
                  <div className="flex items-center justify-center my-6">
                    <div className="flex-1 border-t-2 border-gray-300"></div>
                    <div className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                      <span className="text-lg font-bold text-white">VS</span>
                    </div>
                    <div className="flex-1 border-t-2 border-gray-300"></div>
                  </div>
                )}
                <div className={`p-6 border-2 rounded-xl shadow-md transition-all ${
                  index === 0 
                    ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50' 
                    : 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50'
                }`} role="listitem">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    index === 0 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                      : 'bg-gradient-to-br from-purple-600 to-pink-600'
                  }`}>
                    <span className="text-white font-bold text-lg">{index === 0 ? 'A' : 'B'}</span>
                  </div>
                  <h4 id={`player-result-${index}-heading`} className="text-lg font-bold text-gray-900">
                    {index === 0 ? 'Player A' : 'Player B'}
                  </h4>
                </div>

                <div className="space-y-4">
                  {/* Player Selection */}
                  <div>
                    <label htmlFor={`player-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Player *
                    </label>
                    <select
                      id={`player-${index}`}
                      value={result.playerId}
                      onChange={(e) => updatePlayerResult(index, 'playerId', parseInt(e.target.value))}
                      className={`block w-full px-3 py-2.5 min-h-[44px] border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors text-base text-gray-900 bg-white ${
                        errors[`results.${index}.playerId`]
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                      required
                    >
                      <option value="0">Select a player</option>
                      {result.playerId > 0 && !availablePlayers.find(p => p.id === result.playerId) && (
                        <option value={result.playerId}>
                          {participants.find(p => p.id === result.playerId)?.name}
                        </option>
                      )}
                      {availablePlayers.map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                    {errors[`results.${index}.playerId`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`results.${index}.playerId`]}</p>
                    )}
                  </div>

                  {/* Outcome Display (Auto-calculated) */}
                  {result.outcome && (
                    <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                      result.outcome === 'WIN' ? 'bg-green-50 border-green-300' :
                      result.outcome === 'LOSS' ? 'bg-red-50 border-red-300' :
                      'bg-yellow-50 border-yellow-300'
                    }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        result.outcome === 'WIN' ? 'bg-green-600' :
                        result.outcome === 'LOSS' ? 'bg-red-600' :
                        'bg-yellow-600'
                      }`}>
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {result.outcome === 'WIN' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                          {result.outcome === 'LOSS' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                          {result.outcome === 'DRAW' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 block">Match Result</span>
                        <span className={`text-lg font-bold ${
                          result.outcome === 'WIN' ? 'text-green-700' :
                          result.outcome === 'LOSS' ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>
                          {result.outcome}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Goals - Side by side on larger screens */}
                  {walkoverWinnerId !== null ? (
                    <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Goals are not recorded for walkover matches
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Goals Scored */}
                      <Input
                        label="Goals Scored"
                        type="number"
                        id={`goals-scored-${index}`}
                        name={`goals-scored-${index}`}
                        min="0"
                        value={result.goalsScored.toString()}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          if (!isNaN(value)) {
                            updatePlayerResult(index, 'goalsScored', value);
                          }
                        }}
                        error={errors[`results.${index}.goalsScored`]}
                        required
                      />

                      {/* Goals Conceded - Auto-calculated, shown as read-only */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Goals Conceded
                        </label>
                        <div className="px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-md bg-gray-50 text-gray-600 flex items-center">
                          {result.goalsConceded}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Auto-calculated from opponent&apos;s goals</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Point Calculation Preview */}
                {pointSystem && result.outcome && (
                  <div className="mt-4 space-y-3">
                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl" role="status" aria-live="polite">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-indigo-600 font-medium">
                              {pointOverrides[index]?.enabled ? 'Custom Points' : 'Calculated Points'}
                            </p>
                            <p className="text-2xl font-bold text-indigo-900">
                              {pointOverrides[index]?.enabled 
                                ? pointOverrides[index].customPoints 
                                : calculatePlayerPoints(result, index)
                              }
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const currentOverride = pointOverrides[index];
                            const outcomePoints = result.outcome === 'WIN' ? pointSystem.pointsPerWin :
                                                 result.outcome === 'DRAW' ? pointSystem.pointsPerDraw :
                                                 pointSystem.pointsPerLoss;
                            const goalScoredPoints = result.goalsScored * pointSystem.pointsPerGoalScored;
                            const goalConcededPoints = result.goalsConceded * pointSystem.pointsPerGoalConceded;
                            
                            setPointOverrides({
                              ...pointOverrides,
                              [index]: {
                                enabled: !currentOverride?.enabled,
                                customPoints: currentOverride?.customPoints || calculatePlayerPoints(result, index),
                                extraPoints: currentOverride?.extraPoints || 0,
                                components: currentOverride?.components || {
                                  outcomePoints: { enabled: true, value: outcomePoints },
                                  goalScoredPoints: { enabled: true, value: goalScoredPoints },
                                  goalConcededPoints: { enabled: true, value: goalConcededPoints },
                                },
                              },
                            });
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          {pointOverrides[index]?.enabled ? 'Use Auto' : 'Customize'}
                        </button>
                      </div>
                      
                      {!pointOverrides[index]?.enabled && (
                        <div className="text-xs text-indigo-700 space-y-1">
                          <p className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                            {result.outcome === 'WIN' && `Win: ${pointSystem.pointsPerWin} pts`}
                            {result.outcome === 'DRAW' && `Draw: ${pointSystem.pointsPerDraw} pts`}
                            {result.outcome === 'LOSS' && `Loss: ${pointSystem.pointsPerLoss} pts`}
                          </p>
                          {result.goalsScored > 0 && (
                            <p className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                              Goals Scored: {result.goalsScored} × {pointSystem.pointsPerGoalScored} = {result.goalsScored * pointSystem.pointsPerGoalScored} pts
                            </p>
                          )}
                          {result.goalsConceded > 0 && (
                            <p className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                              Goals Conceded: {result.goalsConceded} × {pointSystem.pointsPerGoalConceded} = {result.goalsConceded * pointSystem.pointsPerGoalConceded} pts
                            </p>
                          )}
                        </div>
                      )}
                      
                      {pointOverrides[index]?.enabled && (
                        <div className="mt-3 pt-3 border-t border-indigo-200 space-y-3">
                          {walkoverWinnerId !== null && (
                            <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-xs font-medium text-orange-800 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {walkoverWinnerId === 0 ? 'Both players forfeited' :
                                 walkoverWinnerId === result.playerId ? 'This player won by walkover' :
                                 'This player lost by walkover (forfeit)'}
                              </p>
                            </div>
                          )}
                          <p className="text-xs font-medium text-indigo-700 mb-2">
                            Select which points to apply:
                          </p>
                          
                          {/* Outcome Points */}
                          <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200 hover:border-indigo-300 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`outcome-points-${index}`}
                                name={`outcome-points-${index}`}
                                checked={pointOverrides[index].components.outcomePoints.enabled}
                                onChange={(e) => {
                                  const components = pointOverrides[index].components;
                                  const newComponents = {
                                    ...components,
                                    outcomePoints: { ...components.outcomePoints, enabled: e.target.checked },
                                  };
                                  const newTotal = 
                                    (newComponents.outcomePoints.enabled ? newComponents.outcomePoints.value : 0) +
                                    (newComponents.goalScoredPoints.enabled ? newComponents.goalScoredPoints.value : 0) +
                                    (newComponents.goalConcededPoints.enabled ? newComponents.goalConcededPoints.value : 0);
                                  
                                  setPointOverrides({
                                    ...pointOverrides,
                                    [index]: {
                                      ...pointOverrides[index],
                                      components: newComponents,
                                      customPoints: newTotal,
                                    },
                                  });
                                }}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {walkoverWinnerId !== null ? (
                                    <>
                                      {walkoverWinnerId === 0 ? 'Both Forfeited' :
                                       walkoverWinnerId === result.playerId ? 'Walkover Win Points' :
                                       'Walkover Loss Points'}
                                    </>
                                  ) : (
                                    <>
                                      {result.outcome === 'WIN' && 'Win Points'}
                                      {result.outcome === 'DRAW' && 'Draw Points'}
                                      {result.outcome === 'LOSS' && 'Loss Points'}
                                    </>
                                  )}
                                </span>
                                <p className="text-xs text-gray-500">
                                  {walkoverWinnerId !== null ? (
                                    <>
                                      {walkoverWinnerId === 0 ? '0 pts' :
                                       walkoverWinnerId === result.playerId ? 
                                         `${pointSystem.pointsForWalkoverWin ?? 3} pts` :
                                         `${pointSystem.pointsForWalkoverLoss ?? -3} pts`}
                                    </>
                                  ) : (
                                    <>
                                      {result.outcome === 'WIN' && `${pointSystem.pointsPerWin} pts`}
                                      {result.outcome === 'DRAW' && `${pointSystem.pointsPerDraw} pts`}
                                      {result.outcome === 'LOSS' && `${pointSystem.pointsPerLoss} pts`}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                            <span className={`text-sm font-bold ${pointOverrides[index].components.outcomePoints.enabled ? 'text-indigo-600' : 'text-gray-400'}`}>
                              {pointOverrides[index].components.outcomePoints.value}
                            </span>
                          </label>

                          {/* Goal Scored Points */}
                          {result.goalsScored > 0 && (
                            <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 hover:border-green-300 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id={`goal-scored-points-${index}`}
                                  name={`goal-scored-points-${index}`}
                                  checked={pointOverrides[index].components.goalScoredPoints.enabled}
                                  onChange={(e) => {
                                    const components = pointOverrides[index].components;
                                    const newComponents = {
                                      ...components,
                                      goalScoredPoints: { ...components.goalScoredPoints, enabled: e.target.checked },
                                    };
                                    const newTotal = 
                                      (newComponents.outcomePoints.enabled ? newComponents.outcomePoints.value : 0) +
                                      (newComponents.goalScoredPoints.enabled ? newComponents.goalScoredPoints.value : 0) +
                                      (newComponents.goalConcededPoints.enabled ? newComponents.goalConcededPoints.value : 0);
                                    
                                    setPointOverrides({
                                      ...pointOverrides,
                                      [index]: {
                                        ...pointOverrides[index],
                                        components: newComponents,
                                        customPoints: newTotal,
                                      },
                                    });
                                  }}
                                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <div>
                                  <span className="text-sm font-medium text-gray-900">Goals Scored</span>
                                  <p className="text-xs text-gray-500">
                                    {result.goalsScored} × {pointSystem.pointsPerGoalScored} pts
                                  </p>
                                </div>
                              </div>
                              <span className={`text-sm font-bold ${pointOverrides[index].components.goalScoredPoints.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                {pointOverrides[index].components.goalScoredPoints.value}
                              </span>
                            </label>
                          )}

                          {/* Goal Conceded Points */}
                          {result.goalsConceded > 0 && (
                            <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200 hover:border-red-300 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id={`goal-conceded-points-${index}`}
                                  name={`goal-conceded-points-${index}`}
                                  checked={pointOverrides[index].components.goalConcededPoints.enabled}
                                  onChange={(e) => {
                                    const components = pointOverrides[index].components;
                                    const newComponents = {
                                      ...components,
                                      goalConcededPoints: { ...components.goalConcededPoints, enabled: e.target.checked },
                                    };
                                    const newTotal = 
                                      (newComponents.outcomePoints.enabled ? newComponents.outcomePoints.value : 0) +
                                      (newComponents.goalScoredPoints.enabled ? newComponents.goalScoredPoints.value : 0) +
                                      (newComponents.goalConcededPoints.enabled ? newComponents.goalConcededPoints.value : 0);
                                    
                                    setPointOverrides({
                                      ...pointOverrides,
                                      [index]: {
                                        ...pointOverrides[index],
                                        components: newComponents,
                                        customPoints: newTotal,
                                      },
                                    });
                                  }}
                                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <div>
                                  <span className="text-sm font-medium text-gray-900">Goals Conceded</span>
                                  <p className="text-xs text-gray-500">
                                    {result.goalsConceded} × {pointSystem.pointsPerGoalConceded} pts
                                  </p>
                                </div>
                              </div>
                              <span className={`text-sm font-bold ${pointOverrides[index].components.goalConcededPoints.enabled ? 'text-red-600' : 'text-gray-400'}`}>
                                {pointOverrides[index].components.goalConcededPoints.value}
                              </span>
                            </label>
                          )}

                          <div className="pt-2 border-t border-indigo-200">
                            <p className="text-xs text-indigo-600">
                              💡 Uncheck any component to exclude it from the total points
                            </p>
                          </div>

                          {/* Extra Points Section */}
                          <div className="pt-3 border-t border-indigo-200">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Extra Points (Bonus/Penalty)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                id={`extra-points-${index}`}
                                name={`extra-points-${index}`}
                                value={pointOverrides[index].extraPoints === 0 ? '' : pointOverrides[index].extraPoints}
                                onChange={(e) => {
                                  const value = e.target.value === '' || e.target.value === '-' ? 0 : parseInt(e.target.value, 10);
                                  const extraPoints = isNaN(value) ? 0 : value;
                                  const components = pointOverrides[index].components;
                                  const baseTotal = 
                                    (components.outcomePoints.enabled ? components.outcomePoints.value : 0) +
                                    (components.goalScoredPoints.enabled ? components.goalScoredPoints.value : 0) +
                                    (components.goalConcededPoints.enabled ? components.goalConcededPoints.value : 0);
                                  
                                  setPointOverrides({
                                    ...pointOverrides,
                                    [index]: {
                                      ...pointOverrides[index],
                                      extraPoints: extraPoints,
                                      customPoints: baseTotal + extraPoints,
                                    },
                                  });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                                placeholder="0"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const components = pointOverrides[index].components;
                                  const baseTotal = 
                                    (components.outcomePoints.enabled ? components.outcomePoints.value : 0) +
                                    (components.goalScoredPoints.enabled ? components.goalScoredPoints.value : 0) +
                                    (components.goalConcededPoints.enabled ? components.goalConcededPoints.value : 0);
                                  
                                  setPointOverrides({
                                    ...pointOverrides,
                                    [index]: {
                                      ...pointOverrides[index],
                                      extraPoints: 0,
                                      customPoints: baseTotal,
                                    },
                                  });
                                }}
                                className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Clear
                              </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-600">
                              Add bonus points (positive) or penalties (negative) for special circumstances
                            </p>
                            {pointOverrides[index].extraPoints !== 0 && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs font-medium text-amber-800">
                                  {pointOverrides[index].extraPoints > 0 ? '🎁 Bonus: +' : '⚠️ Penalty: '}
                                  {pointOverrides[index].extraPoints} pts
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            );
          })
          )}
        </div>
      </div>

      {errors.submit && (
        <ErrorMessage
          title="Submission Error"
          message={errors.submit}
          onDismiss={() => setErrors({ ...errors, submit: undefined })}
        />
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {mode === 'create' ? 'Add Match Result' : 'Update Match Result'}
        </Button>
      </div>
    </form>
  );
}
