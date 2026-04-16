'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ui/Toast';

interface Participant {
  id: number;
  name: string;
  clubId?: number | null;
}

interface BulkMatchUploadProps {
  tournamentId: number;
  matchFormat?: 'SINGLES' | 'DOUBLES';
  participants: Participant[];
  pointSystem?: {
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    pointsPerGoalScored: number;
    pointsPerGoalConceded: number;
    pointsForWalkoverWin?: number;
    pointsForWalkoverLoss?: number;
  };
}

interface ParsedMatch {
  playerAName: string;
  playerBName: string;
  playerCName?: string; // For doubles
  playerDName?: string; // For doubles
  playerAGoals: number;
  playerBGoals: number;
  matchDate: string;
  walkover?: string; // 'normal', 'both', playerName
  playerAExtraPoints?: number;
  playerBExtraPoints?: number;
  playerCExtraPoints?: number; // For doubles
  playerDExtraPoints?: number; // For doubles
  rowNumber?: number; // Track original CSV row
  validationErrors?: string[]; // Track validation errors
  isValid?: boolean; // Quick validation check
}

interface FormMatch extends ParsedMatch {
  id: number;
  playerAId: number;
  playerBId: number | null;
  playerCId?: number; // For doubles
  playerDId?: number; // For doubles
}

type UploadMode = 'form' | 'csv';

export function BulkMatchUpload({ tournamentId, matchFormat = 'SINGLES', participants, pointSystem }: BulkMatchUploadProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<UploadMode>('form');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<ParsedMatch[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  
  // Form mode state
  const today = new Date().toISOString().split('T')[0];
  const [formMatches, setFormMatches] = useState<FormMatch[]>([
    matchFormat === 'DOUBLES'
      ? { 
          id: 1, 
          playerAId: 0, playerBId: 0, playerCId: 0, playerDId: 0,
          playerAName: '', playerBName: '', playerCName: '', playerDName: '',
          playerAGoals: 0, playerBGoals: 0, 
          matchDate: today, 
          walkover: 'normal', 
          playerAExtraPoints: 0, playerBExtraPoints: 0, playerCExtraPoints: 0, playerDExtraPoints: 0 
        }
      : { 
          id: 1, 
          playerAId: 0, playerBId: 0, 
          playerAName: '', playerBName: '', 
          playerAGoals: 0, playerBGoals: 0, 
          matchDate: today, 
          walkover: 'normal', 
          playerAExtraPoints: 0, playerBExtraPoints: 0 
        }
  ]);
  
  const isDoublesFormat = matchFormat === 'DOUBLES';
  
  // Track which matches have expanded point details
  const [expandedMatches, setExpandedMatches] = useState<Set<number>>(new Set());
  
  // Track point component selections for each match
  const [matchPointOverrides, setMatchPointOverrides] = useState<{
    [matchId: number]: {
      playerA: {
        outcomeEnabled: boolean;
        goalsEnabled: boolean;
        concededEnabled: boolean;
      };
      playerB: {
        outcomeEnabled: boolean;
        goalsEnabled: boolean;
        concededEnabled: boolean;
      };
    };
  }>({});
  
  // Track point customization for each match
  const [matchPointCustomization, setMatchPointCustomization] = useState<{
    [matchId: number]: {
      playerA: {
        useOutcome: boolean;
        useGoals: boolean;
      };
      playerB: {
        useOutcome: boolean;
        useGoals: boolean;
      };
    };
  }>({});

  // Calculate points for a player
  const calculatePlayerPoints = (match: FormMatch, isPlayerA: boolean): number => {
    if (!pointSystem) return 0;

    const walkover = match.walkover?.toLowerCase() || 'normal';
    const playerName = isPlayerA ? match.playerAName : match.playerBName;
    const goals = isPlayerA ? match.playerAGoals : match.playerBGoals;
    const conceded = isPlayerA ? match.playerBGoals : match.playerAGoals;
    const extraPoints = isPlayerA ? (match.playerAExtraPoints || 0) : (match.playerBExtraPoints || 0);

    // Get customization settings
    const customization = matchPointCustomization[match.id];
    const playerCustom = isPlayerA ? customization?.playerA : customization?.playerB;
    const useOutcome = playerCustom?.useOutcome ?? true;
    const useGoals = playerCustom?.useGoals ?? true;

    // Handle walkover
    if (walkover === 'both') {
      return extraPoints;
    } else if (walkover === playerName.toLowerCase()) {
      return (useOutcome ? (pointSystem.pointsForWalkoverWin ?? 3) : 0) + extraPoints;
    } else if (walkover !== 'normal' && walkover !== '') {
      return (useOutcome ? (pointSystem.pointsForWalkoverLoss ?? -3) : 0) + extraPoints;
    }

    // Normal match
    let points = 0;
    
    // Outcome points
    if (useOutcome) {
      if (goals > conceded) {
        points += pointSystem.pointsPerWin;
      } else if (goals < conceded) {
        points += pointSystem.pointsPerLoss;
      } else {
        points += pointSystem.pointsPerDraw;
      }
    }

    // Goal points
    if (useGoals) {
      points += goals * pointSystem.pointsPerGoalScored;
      points += conceded * pointSystem.pointsPerGoalConceded;
    }

    points += extraPoints;

    return points;
  };

  const toggleMatchExpanded = (matchId: number) => {
    const newExpanded = new Set(expandedMatches);
    if (newExpanded.has(matchId)) {
      newExpanded.delete(matchId);
    } else {
      newExpanded.add(matchId);
    }
    setExpandedMatches(newExpanded);
  };

  const togglePointComponent = (matchId: number, player: 'playerA' | 'playerB', component: 'useOutcome' | 'useGoals') => {
    setMatchPointCustomization(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [player]: {
          ...(prev[matchId]?.[player] || { useOutcome: true, useGoals: true }),
          [component]: !(prev[matchId]?.[player]?.[component] ?? true),
        },
      },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        showToast('Please select a CSV file', 'error');
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const validateMatch = (match: ParsedMatch): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check if player names are provided
    if (!match.playerAName || !match.playerBName) {
      errors.push('Player A and Player B names are required');
    }
    
    if (isDoublesFormat) {
      if (!match.playerCName || !match.playerDName) {
        errors.push('Player C and Player D names are required for doubles format');
      }
    }
    
    // Check if players exist in participants (case-insensitive)
    const playerAExists = participants.some(
      p => p.name.toLowerCase() === match.playerAName.toLowerCase()
    );
    const playerBExists = participants.some(
      p => p.name.toLowerCase() === match.playerBName.toLowerCase()
    );
    
    if (match.playerAName && !playerAExists) {
      errors.push(`Player A "${match.playerAName}" not found in tournament participants`);
    }
    if (match.playerBName && !playerBExists) {
      errors.push(`Player B "${match.playerBName}" not found in tournament participants`);
    }
    
    if (isDoublesFormat) {
      const playerCExists = participants.some(
        p => p.name.toLowerCase() === (match.playerCName || '').toLowerCase()
      );
      const playerDExists = participants.some(
        p => p.name.toLowerCase() === (match.playerDName || '').toLowerCase()
      );
      
      if (match.playerCName && !playerCExists) {
        errors.push(`Player C "${match.playerCName}" not found in tournament participants`);
      }
      if (match.playerDName && !playerDExists) {
        errors.push(`Player D "${match.playerDName}" not found in tournament participants`);
      }
      
      // Check if all 4 players are different
      const playerNames = [
        match.playerAName?.toLowerCase(),
        match.playerBName?.toLowerCase(),
        match.playerCName?.toLowerCase(),
        match.playerDName?.toLowerCase()
      ].filter(Boolean);
      
      const uniqueNames = new Set(playerNames);
      if (uniqueNames.size !== playerNames.length) {
        errors.push('All four players must be different');
      }
    } else {
      // Check if players are different (singles)
      if (match.playerAName && match.playerBName && 
          match.playerAName.toLowerCase() === match.playerBName.toLowerCase()) {
        errors.push('Players must be different');
      }
    }
    
    // Check date format
    if (!match.matchDate) {
      errors.push('Match date is required');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(match.matchDate)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }
    
    // Check goals are non-negative
    if (match.playerAGoals < 0 || match.playerBGoals < 0) {
      errors.push('Goals cannot be negative');
    }
    
    // Validate walkover value
    if (match.walkover && match.walkover !== 'normal' && match.walkover !== 'both') {
      if (isDoublesFormat) {
        if (match.walkover !== 'team1' && match.walkover !== 'team2') {
          errors.push(`Walkover value must be "normal", "both", "team1", or "team2" for doubles format`);
        }
      } else {
        const walkoverPlayerExists = 
          match.walkover.toLowerCase() === match.playerAName.toLowerCase() ||
          match.walkover.toLowerCase() === match.playerBName.toLowerCase();
        
        if (!walkoverPlayerExists) {
          errors.push(`Walkover value must be "normal", "both", or one of the player names`);
        }
      }
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      setErrors(['CSV file must contain at least a header row and one data row']);
      setPreview([]);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = isDoublesFormat
      ? ['playera', 'playerb', 'playerc', 'playerd', 'playeragoals', 'playerbgoals', 'matchdate']
      : ['playera', 'playerb', 'playeragoals', 'playerbgoals', 'matchdate'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      const optionalCols = isDoublesFormat
        ? 'walkover, playerAExtraPoints, playerBExtraPoints, playerCExtraPoints, playerDExtraPoints'
        : 'walkover, playerAExtraPoints, playerBExtraPoints';
      setErrors([`Missing required columns: ${missingHeaders.join(', ')}. Optional: ${optionalCols}`]);
      setPreview([]);
      return;
    }

    const matches: ParsedMatch[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const match: ParsedMatch = {
        playerAName: '',
        playerBName: '',
        playerCName: isDoublesFormat ? '' : undefined,
        playerDName: isDoublesFormat ? '' : undefined,
        playerAGoals: 0,
        playerBGoals: 0,
        matchDate: '',
        walkover: 'normal',
        rowNumber: i + 1,
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'playera':
            match.playerAName = value;
            break;
          case 'playerb':
            match.playerBName = value;
            break;
          case 'playerc':
            if (isDoublesFormat) match.playerCName = value;
            break;
          case 'playerd':
            if (isDoublesFormat) match.playerDName = value;
            break;
          case 'playeragoals':
            match.playerAGoals = parseInt(value) || 0;
            break;
          case 'playerbgoals':
            match.playerBGoals = parseInt(value) || 0;
            break;
          case 'matchdate':
            match.matchDate = value;
            break;
          case 'walkover':
            match.walkover = value.toLowerCase() || 'normal';
            break;
          case 'playeraextrapoints':
            match.playerAExtraPoints = parseInt(value) || 0;
            break;
          case 'playerbextrapoints':
            match.playerBExtraPoints = parseInt(value) || 0;
            break;
          case 'playercextrapoints':
            if (isDoublesFormat) match.playerCExtraPoints = parseInt(value) || 0;
            break;
          case 'playerdextrapoints':
            if (isDoublesFormat) match.playerDExtraPoints = parseInt(value) || 0;
            break;
        }
      });

      // Validate the match
      const validation = validateMatch(match);
      match.validationErrors = validation.errors;
      match.isValid = validation.isValid;
      
      matches.push(match);
    }

    setPreview(matches);
    setErrors(parseErrors);
  };

  const handleUpload = async () => {
    if (preview.length === 0) {
      showToast('No matches to upload', 'error');
      return;
    }

    // Check if there are any invalid matches
    const invalidMatches = preview.filter(m => !m.isValid);
    if (invalidMatches.length > 0) {
      showToast(`Cannot upload: ${invalidMatches.length} match(es) have validation errors. Please fix them first.`, 'error');
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: preview }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to upload matches', 'error');
        if (data.errors && data.errors.length > 0) {
          setErrors(data.errors);
        }
        return;
      }

      // Show detailed results
      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
        showToast(
          `Added ${data.added} match(es), but ${data.skipped} were skipped. Check errors below.`,
          data.added > 0 ? 'warning' : 'error'
        );
        // Don't redirect if there were errors - let user fix them
        return;
      }

      showToast(
        `Successfully added ${data.added} match(es)!`,
        'success'
      );
      
      router.push(`/dashboard/tournaments/${tournamentId}`);
      router.refresh();
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const updatePreviewMatch = (index: number, field: keyof ParsedMatch, value: any) => {
    const updatedPreview = [...preview];
    updatedPreview[index] = { ...updatedPreview[index], [field]: value };
    
    // Re-validate the match
    const validation = validateMatch(updatedPreview[index]);
    updatedPreview[index].validationErrors = validation.errors;
    updatedPreview[index].isValid = validation.isValid;
    
    setPreview(updatedPreview);
  };

  const removePreviewMatch = (index: number) => {
    setPreview(preview.filter((_, i) => i !== index));
  };

  const downloadTemplate = () => {
    const playerNames = participants.map(p => p.name).slice(0, isDoublesFormat ? 8 : 4);
    
    const template = isDoublesFormat
      ? `playerA,playerB,playerC,playerD,playerAGoals,playerBGoals,matchDate,walkover,playerAExtraPoints,playerBExtraPoints,playerCExtraPoints,playerDExtraPoints
${playerNames[0] || 'Player 1'},${playerNames[1] || 'Player 2'},${playerNames[2] || 'Player 3'},${playerNames[3] || 'Player 4'},3,1,2024-01-15,normal,0,0,0,0
${playerNames[4] || 'Player 5'},${playerNames[5] || 'Player 6'},${playerNames[6] || 'Player 7'},${playerNames[7] || 'Player 8'},2,2,2024-01-16,normal,0,0,0,0
${playerNames[0] || 'Player 1'},${playerNames[1] || 'Player 2'},${playerNames[2] || 'Player 3'},${playerNames[3] || 'Player 4'},0,0,2024-01-17,team1,0,0,0,0
${playerNames[4] || 'Player 5'},${playerNames[5] || 'Player 6'},${playerNames[6] || 'Player 7'},${playerNames[7] || 'Player 8'},0,0,2024-01-18,both,0,0,0,0

Instructions for DOUBLES (2v2) Format:
- playerA and playerB form Team 1
- playerC and playerD form Team 2
- All player names must match participant names exactly
- playerAGoals = Team 1 goals, playerBGoals = Team 2 goals
- Goals must be non-negative integers
- matchDate format: YYYY-MM-DD
- walkover options:
  * normal (or empty) = regular match with goals
  * both = both teams forfeited (no points)
  * team1 = Team 1 won by walkover
  * team2 = Team 2 won by walkover
- Extra points (optional):
  * positive numbers = bonus points
  * negative numbers = penalty points
  * 0 or empty = no extra points
- Note: Doubles matches affect CLUB/TEAM stats only, not individual player stats

Available Participants:
${participants.map(p => p.name).join(', ')}`
      : `playerA,playerB,playerAGoals,playerBGoals,matchDate,walkover,playerAExtraPoints,playerBExtraPoints
${playerNames[0] || 'Player 1'},${playerNames[1] || 'Player 2'},3,1,2024-01-15,normal,0,0
${playerNames[2] || 'Player 3'},${playerNames[3] || 'Player 4'},2,2,2024-01-16,normal,0,0
${playerNames[0] || 'Player 1'},${playerNames[2] || 'Player 3'},0,0,2024-01-17,${playerNames[0] || 'Player 1'},0,0
${playerNames[1] || 'Player 2'},${playerNames[3] || 'Player 4'},0,0,2024-01-18,both,0,0
${playerNames[0] || 'Player 1'},${playerNames[1] || 'Player 2'},3,1,2024-01-19,normal,5,-2

Instructions for SINGLES (1v1) Format:
- playerA and playerB must match participant names exactly
- Goals must be non-negative integers
- matchDate format: YYYY-MM-DD
- walkover options:
  * normal (or empty) = regular match with goals
  * both = both players forfeited (no points)
  * player name = that player won by walkover
- playerAExtraPoints and playerBExtraPoints (optional):
  * positive numbers = bonus points
  * negative numbers = penalty points
  * 0 or empty = no extra points

Available Participants:
${participants.map(p => p.name).join(', ')}`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matches_template_${isDoublesFormat ? 'doubles' : 'singles'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Form mode handlers
  const addFormMatch = () => {
    const newId = Math.max(...formMatches.map(m => m.id), 0) + 1;
    setFormMatches([...formMatches, isDoublesFormat
      ? { 
          id: newId, 
          playerAId: 0, playerBId: 0, playerCId: 0, playerDId: 0,
          playerAName: '', playerBName: '', playerCName: '', playerDName: '',
          playerAGoals: 0, playerBGoals: 0, 
          matchDate: today,
          walkover: 'normal',
          playerAExtraPoints: 0, playerBExtraPoints: 0, playerCExtraPoints: 0, playerDExtraPoints: 0
        }
      : { 
          id: newId, 
          playerAId: 0, playerBId: 0, 
          playerAName: '', playerBName: '', 
          playerAGoals: 0, playerBGoals: 0, 
          matchDate: today,
          walkover: 'normal',
          playerAExtraPoints: 0, playerBExtraPoints: 0
        }
    ]);
  };

  const removeFormMatch = (id: number) => {
    if (formMatches.length > 1) {
      setFormMatches(formMatches.filter(m => m.id !== id));
    }
  };

  const updateFormMatch = (id: number, field: keyof FormMatch, value: any) => {
    setFormMatches(prevMatches => prevMatches.map(match => {
      if (match.id === id) {
        const updated = { ...match, [field]: value };
        
        // Auto-populate names when IDs change
        if (field === 'playerAId') {
          const participant = participants.find(p => p.id === Number(value));
          updated.playerAName = participant?.name || '';
        } else if (field === 'playerBId') {
          const participant = participants.find(p => p.id === Number(value));
          updated.playerBName = participant?.name || '';
        } else if (field === 'playerCId' && isDoublesFormat) {
          const participant = participants.find(p => p.id === Number(value));
          updated.playerCName = participant?.name || '';
        } else if (field === 'playerDId' && isDoublesFormat) {
          const participant = participants.find(p => p.id === Number(value));
          updated.playerDName = participant?.name || '';
        }
        
        return updated;
      }
      return match;
    }));
  };

  // Get available players for a specific position in a match with club filtering
  const getAvailablePlayersForMatch = (match: FormMatch, position: 'A' | 'B' | 'C' | 'D'): Participant[] => {
    // Get the ID of the player currently in this position
    const currentPlayerId = position === 'A' ? match.playerAId : 
                           position === 'B' ? match.playerBId :
                           position === 'C' ? match.playerCId :
                           match.playerDId;
    
    // Exclude already selected players in this match (except the current position)
    const selectedIds = [match.playerAId, match.playerBId, match.playerCId, match.playerDId]
      .filter(id => id && id > 0 && id !== currentPlayerId);
    
    let availablePlayers = participants.filter(p => !selectedIds.includes(p.id));
    
    // For doubles matches, apply team-based club filtering
    if (isDoublesFormat) {
      if (position === 'B') {
        // Player B must be from same club as Player A (or both free agents)
        if (match.playerAId && match.playerAId > 0) {
          const playerA = participants.find(p => p.id === match.playerAId);
          if (playerA) {
            if (playerA.clubId) {
              // Player A has a club - only show players from same club
              availablePlayers = availablePlayers.filter(p => p.clubId === playerA.clubId);
            } else {
              // Player A is a free agent - only show free agents
              availablePlayers = availablePlayers.filter(p => !p.clubId);
            }
          }
        }
      } else if (position === 'A') {
        // If Player B is already selected, filter Player A by Player B's club
        if (match.playerBId && match.playerBId > 0) {
          const playerB = participants.find(p => p.id === match.playerBId);
          if (playerB) {
            if (playerB.clubId) {
              // Player B has a club - only show players from same club
              availablePlayers = availablePlayers.filter(p => p.clubId === playerB.clubId);
            } else {
              // Player B is a free agent - only show free agents
              availablePlayers = availablePlayers.filter(p => !p.clubId);
            }
          }
        }
      } else if (position === 'D') {
        // Player D must be from same club as Player C (or both free agents)
        if (match.playerCId && match.playerCId > 0) {
          const playerC = participants.find(p => p.id === match.playerCId);
          if (playerC) {
            if (playerC.clubId) {
              // Player C has a club - only show players from same club
              availablePlayers = availablePlayers.filter(p => p.clubId === playerC.clubId);
            } else {
              // Player C is a free agent - only show free agents
              availablePlayers = availablePlayers.filter(p => !p.clubId);
            }
          }
        }
      } else if (position === 'C') {
        // If Player D is already selected, filter Player C by Player D's club
        if (match.playerDId && match.playerDId > 0) {
          const playerD = participants.find(p => p.id === match.playerDId);
          if (playerD) {
            if (playerD.clubId) {
              // Player D has a club - only show players from same club
              availablePlayers = availablePlayers.filter(p => p.clubId === playerD.clubId);
            } else {
              // Player D is a free agent - only show free agents
              availablePlayers = availablePlayers.filter(p => !p.clubId);
            }
          }
        }
      }
    }
    
    return availablePlayers;
  };

  const handleFormSubmit = async () => {
    // Validate form matches
    const validationErrors: string[] = [];
    formMatches.forEach((match, index) => {
      if (!match.playerAId || match.playerAId === 0) {
        validationErrors.push(`Match ${index + 1}: Player A is required`);
      }
      // Player B is now optional for singles matches
      // No validation error if Player B is not selected
      if (isDoublesFormat) {
        if (!match.playerCId || match.playerCId === 0) {
          validationErrors.push(`Match ${index + 1}: Player C is required`);
        }
        if (!match.playerDId || match.playerDId === 0) {
          validationErrors.push(`Match ${index + 1}: Player D is required`);
        }
        // Check all 4 players are different
        const playerIds = [match.playerAId, match.playerBId, match.playerCId, match.playerDId].filter(id => id !== 0);
        const uniqueIds = new Set(playerIds);
        if (uniqueIds.size !== playerIds.length) {
          validationErrors.push(`Match ${index + 1}: All players must be different`);
        }
      } else {
        // For singles, only check if both players are selected and they're the same
        if (match.playerAId && match.playerBId && match.playerAId === match.playerBId && match.playerAId !== 0) {
          validationErrors.push(`Match ${index + 1}: Players must be different`);
        }
      }
      if (!match.matchDate) {
        validationErrors.push(`Match ${index + 1}: Match date is required`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsUploading(true);

    try {
      const matchesData = formMatches.map(match => isDoublesFormat
        ? {
            playerAName: match.playerAName,
            playerBName: match.playerBName,
            playerCName: match.playerCName,
            playerDName: match.playerDName,
            playerAGoals: match.playerAGoals,
            playerBGoals: match.playerBGoals,
            matchDate: match.matchDate,
            walkover: match.walkover || 'normal',
            playerAExtraPoints: match.playerAExtraPoints || 0,
            playerBExtraPoints: match.playerBExtraPoints || 0,
            playerCExtraPoints: match.playerCExtraPoints || 0,
            playerDExtraPoints: match.playerDExtraPoints || 0,
          }
        : {
            playerAName: match.playerAName,
            playerBName: match.playerBName,
            playerAGoals: match.playerAGoals,
            playerBGoals: match.playerBGoals,
            matchDate: match.matchDate,
            walkover: match.walkover || 'normal',
            playerAExtraPoints: match.playerAExtraPoints || 0,
            playerBExtraPoints: match.playerBExtraPoints || 0,
          }
      );

      const response = await fetch(`/api/tournaments/${tournamentId}/matches/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: matchesData }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to upload matches', 'error');
        return;
      }

      // Show detailed results
      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
        showToast(
          `Added ${data.added} match(es), but ${data.skipped} were skipped. Check errors below.`,
          data.added > 0 ? 'warning' : 'error'
        );
        // Don't redirect if there were errors
        return;
      }

      showToast(
        `Successfully added ${data.added} match(es)!`,
        'success'
      );
      
      router.push(`/dashboard/tournaments/${tournamentId}`);
      router.refresh();
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Method</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setMode('form')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              mode === 'form'
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`flex items-center justify-center gap-2 ${
              mode === 'form' ? 'text-violet-700' : 'text-gray-600'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Form Entry</span>
            </div>
            <p className={`text-xs mt-1 ${
              mode === 'form' ? 'text-violet-600' : 'text-gray-500'
            }`}>Add matches one by one</p>
          </button>
          <button
            onClick={() => setMode('csv')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              mode === 'csv'
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`flex items-center justify-center gap-2 ${
              mode === 'csv' ? 'text-violet-700' : 'text-gray-600'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="font-medium">CSV Upload</span>
            </div>
            <p className={`text-xs mt-1 ${
              mode === 'csv' ? 'text-violet-600' : 'text-gray-500'
            }`}>Upload multiple matches at once</p>
          </button>
        </div>
      </div>

      {/* Form Mode */}
      {mode === 'form' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Match Details</h2>
              <button
                onClick={addFormMatch}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Match
              </button>
            </div>

            <div className="space-y-4">
              {formMatches.map((match, index) => (
                <div key={match.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Match {index + 1}</h3>
                    {formMatches.length > 1 && (
                      <button
                        onClick={() => removeFormMatch(match.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Team 1 Header for Doubles */}
                    {isDoublesFormat && (
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px flex-1 bg-blue-200"></div>
                          <span className="text-sm font-semibold text-blue-700">Team 1</span>
                          <div className="h-px flex-1 bg-blue-200"></div>
                        </div>
                      </div>
                    )}

                    {/* Player A */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isDoublesFormat ? 'Team 1 - Player A' : 'Player A'}
                      </label>
                      <select
                        value={String(match.playerAId)}
                        onChange={(e) => updateFormMatch(match.id, 'playerAId', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="0">Select Player A</option>
                        {getAvailablePlayersForMatch(match, 'A').map(p => (
                          <option key={p.id} value={String(p.id)}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Player B */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isDoublesFormat ? 'Team 1 - Player B' : 'Player B'} {!isDoublesFormat && <span className="text-xs text-gray-500">(Optional - External Player)</span>}
                      </label>
                      <select
                        value={String(match.playerBId || 0)}
                        onChange={(e) => updateFormMatch(match.id, 'playerBId', Number(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="0">{isDoublesFormat ? 'Select Player B' : 'External Player (not in club)'}</option>
                        {getAvailablePlayersForMatch(match, 'B').map(p => (
                          <option key={p.id} value={String(p.id)}>{p.name}</option>
                        ))}
                      </select>
                      {!isDoublesFormat && !match.playerBId && (
                        <p className="mt-1 text-xs text-blue-600">Stats will only be tracked for Player A</p>
                      )}
                    </div>

                    {/* Team 2 Header for Doubles */}
                    {isDoublesFormat && (
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2 mt-2">
                          <div className="h-px flex-1 bg-purple-200"></div>
                          <span className="text-sm font-semibold text-purple-700">Team 2</span>
                          <div className="h-px flex-1 bg-purple-200"></div>
                        </div>
                      </div>
                    )}

                    {/* Player C (Doubles only) */}
                    {isDoublesFormat && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team 2 - Player C
                        </label>
                        <select
                          value={String(match.playerCId || 0)}
                          onChange={(e) => updateFormMatch(match.id, 'playerCId', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                        >
                          <option value="0">Select Player C</option>
                          {getAvailablePlayersForMatch(match, 'C').map(p => (
                            <option key={p.id} value={String(p.id)}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Player D (Doubles only) */}
                    {isDoublesFormat && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team 2 - Player D
                        </label>
                        <select
                          value={String(match.playerDId || 0)}
                          onChange={(e) => updateFormMatch(match.id, 'playerDId', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                        >
                          <option value="0">Select Player D</option>
                          {getAvailablePlayersForMatch(match, 'D').map(p => (
                            <option key={p.id} value={String(p.id)}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Goals Section Header */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2 mt-2">
                        <div className="h-px flex-1 bg-gray-200"></div>
                        <span className="text-sm font-semibold text-gray-700">
                          {isDoublesFormat ? 'Team Goals' : 'Goals'}
                        </span>
                        <div className="h-px flex-1 bg-gray-200"></div>
                      </div>
                    </div>

                    {/* Player A Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isDoublesFormat ? 'Team 1 Goals' : 'Player A Goals'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={match.playerAGoals}
                        onChange={(e) => updateFormMatch(match.id, 'playerAGoals', Number(e.target.value))}
                        disabled={match.walkover !== 'normal'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {match.walkover !== 'normal' && (
                        <p className="mt-1 text-xs text-gray-500">Goals not recorded for walkover</p>
                      )}
                    </div>

                    {/* Player B Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isDoublesFormat ? 'Team 2 Goals' : 'Player B Goals'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={match.playerBGoals}
                        onChange={(e) => updateFormMatch(match.id, 'playerBGoals', Number(e.target.value))}
                        disabled={match.walkover !== 'normal'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {match.walkover !== 'normal' && (
                        <p className="mt-1 text-xs text-gray-500">Goals not recorded for walkover</p>
                      )}
                    </div>

                    {/* Walkover */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Walkover / Forfeit
                      </label>
                      <select
                        value={match.walkover || 'normal'}
                        onChange={(e) => {
                          updateFormMatch(match.id, 'walkover', e.target.value);
                          // Reset goals when walkover is selected
                          if (e.target.value !== 'normal') {
                            updateFormMatch(match.id, 'playerAGoals', 0);
                            updateFormMatch(match.id, 'playerBGoals', 0);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="normal">Normal Match (no walkover)</option>
                        <option value="both">Both {isDoublesFormat ? 'Teams' : 'Players'} Forfeited</option>
                        {isDoublesFormat ? (
                          <>
                            {match.playerAName && match.playerBName && (
                              <option value="team1">Team 1 ({match.playerAName} & {match.playerBName}) Won by Walkover</option>
                            )}
                            {match.playerCName && match.playerDName && (
                              <option value="team2">Team 2 ({match.playerCName} & {match.playerDName}) Won by Walkover</option>
                            )}
                          </>
                        ) : (
                          <>
                            {match.playerAName && (
                              <option value={match.playerAName}>{match.playerAName} Won by Walkover</option>
                            )}
                            {match.playerBName && (
                              <option value={match.playerBName}>{match.playerBName} Won by Walkover</option>
                            )}
                          </>
                        )}
                      </select>
                      {match.walkover && match.walkover !== 'normal' && (
                        <p className="mt-1 text-sm text-orange-600">
                          {match.walkover === 'both' 
                            ? `⚠️ Both ${isDoublesFormat ? 'teams' : 'players'} forfeited - no points will be awarded`
                            : isDoublesFormat
                              ? match.walkover === 'team1'
                                ? `✓ Team 1 wins by walkover`
                                : `✓ Team 2 wins by walkover`
                              : `✓ ${match.walkover} wins by walkover`
                          }
                        </p>
                      )}
                    </div>

                    {/* Match Date */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Match Date
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={match.matchDate}
                          onChange={(e) => updateFormMatch(match.id, 'matchDate', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => updateFormMatch(match.id, 'matchDate', today)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Today
                        </button>
                      </div>
                    </div>

                    {/* Extra Points Section */}
                    <div className="md:col-span-2 pt-3 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Extra Points (Bonus/Penalty) - Optional
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Player A Extra Points
                          </label>
                          <input
                            type="number"
                            value={match.playerAExtraPoints === 0 ? '' : match.playerAExtraPoints}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                              updateFormMatch(match.id, 'playerAExtraPoints', isNaN(value) ? 0 : value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Player B Extra Points
                          </label>
                          <input
                            type="number"
                            value={match.playerBExtraPoints === 0 ? '' : match.playerBExtraPoints}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                              updateFormMatch(match.id, 'playerBExtraPoints', isNaN(value) ? 0 : value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Add bonus (positive) or penalty (negative) points for special circumstances
                      </p>
                    </div>
                  </div>

                  {/* Match Outcome Display */}
                  {match.playerAId !== 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Match Outcome:</span>
                        <div className="flex items-center gap-2">
                          {match.walkover === 'both' ? (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                              Both Forfeited
                            </span>
                          ) : match.walkover === match.playerAName ? (
                            <>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {match.playerAName} Wins (Walkover)
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {match.playerBName} Loses (Forfeit)
                              </span>
                            </>
                          ) : match.walkover === match.playerBName ? (
                            <>
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {match.playerAName} Loses (Forfeit)
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {match.playerBName} Wins (Walkover)
                              </span>
                            </>
                          ) : match.playerAGoals > match.playerBGoals ? (
                            <>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {match.playerAName} Wins
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {match.playerBName} Loses
                              </span>
                            </>
                          ) : match.playerBGoals > match.playerAGoals ? (
                            <>
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {match.playerAName} Loses
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {match.playerBName} Wins
                              </span>
                            </>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                              Draw
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Point Calculation Display */}
                      {pointSystem && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => toggleMatchExpanded(match.id)}
                            className="w-full flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <span className="text-sm font-medium text-indigo-900">
                              {expandedMatches.has(match.id) ? '▼' : '▶'} Point Calculation
                            </span>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-xs text-indigo-600 block">{match.playerAName}</span>
                                <span className="text-lg font-bold text-indigo-900">
                                  {calculatePlayerPoints(match, true)} pts
                                </span>
                              </div>
                              <span className="text-indigo-400">vs</span>
                              <div className="text-right">
                                <span className="text-xs text-indigo-600 block">{match.playerBName}</span>
                                <span className="text-lg font-bold text-indigo-900">
                                  {calculatePlayerPoints(match, false)} pts
                                </span>
                              </div>
                            </div>
                          </button>

                          {expandedMatches.has(match.id) && (
                            <div className="mt-2 p-4 bg-white border border-indigo-200 rounded-lg space-y-3">
                              {/* Player A Points */}
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-blue-900 mb-3">{match.playerAName}</h4>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={matchPointCustomization[match.id]?.playerA?.useOutcome ?? true}
                                      onChange={() => togglePointComponent(match.id, 'playerA', 'useOutcome')}
                                      className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-xs text-blue-700">
                                      {match.walkover === 'both' ? 'Both Forfeited: 0 pts' :
                                       match.walkover === match.playerAName ? `Walkover Win: ${pointSystem.pointsForWalkoverWin ?? 3} pts` :
                                       match.walkover && match.walkover !== 'normal' ? `Walkover Loss: ${pointSystem.pointsForWalkoverLoss ?? -3} pts` :
                                       match.playerAGoals > match.playerBGoals ? `Win: ${pointSystem.pointsPerWin} pts` :
                                       match.playerAGoals < match.playerBGoals ? `Loss: ${pointSystem.pointsPerLoss} pts` :
                                       `Draw: ${pointSystem.pointsPerDraw} pts`}
                                    </span>
                                  </label>
                                  {match.walkover === 'normal' || !match.walkover ? (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={matchPointCustomization[match.id]?.playerA?.useGoals ?? true}
                                        onChange={() => togglePointComponent(match.id, 'playerA', 'useGoals')}
                                        className="w-4 h-4 text-blue-600 rounded"
                                      />
                                      <span className="text-xs text-blue-700">
                                        Goals: {match.playerAGoals} × {pointSystem.pointsPerGoalScored} + {match.playerBGoals} × {pointSystem.pointsPerGoalConceded} = {match.playerAGoals * pointSystem.pointsPerGoalScored + match.playerBGoals * pointSystem.pointsPerGoalConceded} pts
                                      </span>
                                    </label>
                                  ) : null}
                                  {(match.playerAExtraPoints ?? 0) !== 0 && (
                                    <p className="text-xs font-semibold text-amber-700 ml-6">
                                      Extra: {(match.playerAExtraPoints ?? 0) > 0 ? '+' : ''}{match.playerAExtraPoints} pts
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Player B Points */}
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-purple-900 mb-3">{match.playerBName}</h4>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={matchPointCustomization[match.id]?.playerB?.useOutcome ?? true}
                                      onChange={() => togglePointComponent(match.id, 'playerB', 'useOutcome')}
                                      className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-xs text-purple-700">
                                      {match.walkover === 'both' ? 'Both Forfeited: 0 pts' :
                                       match.walkover === match.playerBName ? `Walkover Win: ${pointSystem.pointsForWalkoverWin ?? 3} pts` :
                                       match.walkover && match.walkover !== 'normal' ? `Walkover Loss: ${pointSystem.pointsForWalkoverLoss ?? -3} pts` :
                                       match.playerBGoals > match.playerAGoals ? `Win: ${pointSystem.pointsPerWin} pts` :
                                       match.playerBGoals < match.playerAGoals ? `Loss: ${pointSystem.pointsPerLoss} pts` :
                                       `Draw: ${pointSystem.pointsPerDraw} pts`}
                                    </span>
                                  </label>
                                  {match.walkover === 'normal' || !match.walkover ? (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={matchPointCustomization[match.id]?.playerB?.useGoals ?? true}
                                        onChange={() => togglePointComponent(match.id, 'playerB', 'useGoals')}
                                        className="w-4 h-4 text-purple-600 rounded"
                                      />
                                      <span className="text-xs text-purple-700">
                                        Goals: {match.playerBGoals} × {pointSystem.pointsPerGoalScored} + {match.playerAGoals} × {pointSystem.pointsPerGoalConceded} = {match.playerBGoals * pointSystem.pointsPerGoalScored + match.playerAGoals * pointSystem.pointsPerGoalConceded} pts
                                      </span>
                                    </label>
                                  ) : null}
                                  {(match.playerBExtraPoints ?? 0) !== 0 && (
                                    <p className="text-xs font-semibold text-amber-700 ml-6">
                                      Extra: {(match.playerBExtraPoints ?? 0) > 0 ? '+' : ''}{match.playerBExtraPoints} pts
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Validation Errors</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Submit */}
          <div className="flex justify-end">
            <button
              onClick={handleFormSubmit}
              disabled={isUploading}
              className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Matches
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* CSV Mode */}
      {mode === 'csv' && (
        <>
          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Download the CSV template</li>
              <li>Fill in match details (playerA, playerB, playerAGoals, playerBGoals, matchDate are required)</li>
              <li>Player names must match tournament participants exactly</li>
              <li>Goals must be non-negative integers</li>
              <li>Date format: YYYY-MM-DD</li>
              <li>Walkover column (optional): &quot;normal&quot;, &quot;both&quot;, or player name</li>
              <li>Upload the CSV file and review the preview</li>
              <li>Click &quot;Upload Matches&quot; to add them to the tournament</li>
            </ol>
            <div className="mt-4 flex gap-3">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV Template
              </button>
            </div>
            
            {/* Available Participants */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Available Participants ({participants.length})
              </h3>
              <p className="text-xs text-blue-700 mb-2">
                Player names in your CSV must exactly match one of these names:
              </p>
              <div className="flex flex-wrap gap-2">
                {participants.map(p => (
                  <span key={p.id} className="px-2 py-1 bg-white border border-blue-300 rounded text-xs text-blue-900 font-medium">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none p-2"
              />
              {file && (
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {file.name}
                </span>
              )}
            </div>
          </div>

          {/* CSV Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Errors</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Preview ({preview.length} matches)
                  </h2>
                  {preview.some(m => !m.isValid) && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ {preview.filter(m => !m.isValid).length} match(es) have validation errors
                    </p>
                  )}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || preview.some(m => !m.isValid)}
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Matches
                    </>
                  )}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player A</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player B</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((match, index) => {
                      const isPlayerAWinner = match.playerAGoals > match.playerBGoals;
                      const isPlayerBWinner = match.playerBGoals > match.playerAGoals;
                      const isDraw = match.playerAGoals === match.playerBGoals;
                      
                      return (
                        <tr key={index} className={!match.isValid ? 'bg-red-50' : ''}>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {match.rowNumber || index + 2}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {match.isValid ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-medium">Valid</span>
                              </span>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1 text-red-600">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs font-medium">Error</span>
                                </span>
                                {match.validationErrors && match.validationErrors.length > 0 && (
                                  <div className="text-xs text-red-600 mt-1">
                                    {match.validationErrors.map((err, i) => (
                                      <div key={i}>• {err}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={match.isValid ? "text-gray-900" : "text-red-700 font-medium"}>{match.playerAName || '(empty)'}</span>
                              {match.isValid && isPlayerAWinner && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Winner
                                </span>
                              )}
                              {match.isValid && isPlayerBWinner && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">
                                  Loser
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={match.isValid ? "text-gray-900" : "text-red-700 font-medium"}>{match.playerBName || '(empty)'}</span>
                              {match.isValid && isPlayerBWinner && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Winner
                                </span>
                              )}
                              {match.isValid && isPlayerAWinner && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">
                                  Loser
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                            {match.playerAGoals} - {match.playerBGoals}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{match.matchDate || '(empty)'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
