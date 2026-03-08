'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';

type TournamentType = 'LEAGUE' | 'KNOCKOUT' | 'GROUP_STAGE' | 'GROUP_KNOCKOUT' | 'LEAGUE_KNOCKOUT' | 'MIXED';

interface StageConfig {
  stageName: string;
  stageOrder: number;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  pointsForAdvancing: number;
}

export function PointSystemWizard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Tournament Configuration
  const [tournamentType, setTournamentType] = useState<TournamentType>('LEAGUE');
  const [numberOfTeams, setNumberOfTeams] = useState(8);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Base Points
  const [basePoints, setBasePoints] = useState({
    pointsPerWin: 3,
    pointsPerDraw: 1,
    pointsPerLoss: 0,
    pointsPerGoalScored: 0,
    pointsPerGoalConceded: 0,
    pointsForWalkoverWin: 3,
    pointsForWalkoverLoss: -3,
    pointsPerCleanSheet: 0,
  });

  // Step 3: Stage Points
  const [stagePoints, setStagePoints] = useState<StageConfig[]>([]);

  // Generate stages based on tournament type
  const generateStages = () => {
    const stages: StageConfig[] = [];
    
    switch (tournamentType) {
      case 'LEAGUE':
        stages.push({
          stageName: 'League Stage',
          stageOrder: 1,
          pointsForWin: basePoints.pointsPerWin,
          pointsForDraw: basePoints.pointsPerDraw,
          pointsForLoss: basePoints.pointsPerLoss,
          pointsForAdvancing: 0,
        });
        break;
        
      case 'KNOCKOUT':
        const knockoutStages = getKnockoutStages(numberOfTeams);
        knockoutStages.forEach((stageName, index) => {
          stages.push({
            stageName,
            stageOrder: index + 1,
            pointsForWin: basePoints.pointsPerWin,
            pointsForDraw: 0,
            pointsForLoss: basePoints.pointsPerLoss,
            pointsForAdvancing: index < knockoutStages.length - 1 ? 5 : 0,
          });
        });
        break;
        
      case 'GROUP_STAGE':
        const numGroups = Math.ceil(numberOfTeams / 4);
        for (let i = 0; i < numGroups; i++) {
          stages.push({
            stageName: `Group ${String.fromCharCode(65 + i)}`,
            stageOrder: i + 1,
            pointsForWin: basePoints.pointsPerWin,
            pointsForDraw: basePoints.pointsPerDraw,
            pointsForLoss: basePoints.pointsPerLoss,
            pointsForAdvancing: 0,
          });
        }
        break;
        
      case 'GROUP_KNOCKOUT':
        const groups = Math.ceil(numberOfTeams / 4);
        // Group stages
        for (let i = 0; i < groups; i++) {
          stages.push({
            stageName: `Group ${String.fromCharCode(65 + i)}`,
            stageOrder: i + 1,
            pointsForWin: basePoints.pointsPerWin,
            pointsForDraw: basePoints.pointsPerDraw,
            pointsForLoss: basePoints.pointsPerLoss,
            pointsForAdvancing: 3,
          });
        }
        // Knockout stages
        const qualifiedTeams = groups * 2; // Top 2 from each group
        const knockoutRounds = getKnockoutStages(qualifiedTeams);
        knockoutRounds.forEach((stageName, index) => {
          stages.push({
            stageName,
            stageOrder: groups + index + 1,
            pointsForWin: basePoints.pointsPerWin,
            pointsForDraw: 0,
            pointsForLoss: basePoints.pointsPerLoss,
            pointsForAdvancing: index < knockoutRounds.length - 1 ? 5 : 0,
          });
        });
        break;
        
      case 'LEAGUE_KNOCKOUT':
        // League stage
        stages.push({
          stageName: 'League Stage',
          stageOrder: 1,
          pointsForWin: basePoints.pointsPerWin,
          pointsForDraw: basePoints.pointsPerDraw,
          pointsForLoss: basePoints.pointsPerLoss,
          pointsForAdvancing: 2,
        });
        // Playoff stages (top teams qualify)
        const playoffTeams = Math.min(8, Math.floor(numberOfTeams / 2)); // Top half or max 8 teams
        const playoffRounds = getKnockoutStages(playoffTeams);
        playoffRounds.forEach((stageName, index) => {
          stages.push({
            stageName: `Playoff - ${stageName}`,
            stageOrder: index + 2,
            pointsForWin: basePoints.pointsPerWin,
            pointsForDraw: 0,
            pointsForLoss: basePoints.pointsPerLoss,
            pointsForAdvancing: index < playoffRounds.length - 1 ? 5 : 0,
          });
        });
        break;
        
      case 'MIXED':
        // Start with one custom stage
        stages.push({
          stageName: 'Stage 1',
          stageOrder: 1,
          pointsForWin: basePoints.pointsPerWin,
          pointsForDraw: basePoints.pointsPerDraw,
          pointsForLoss: basePoints.pointsPerLoss,
          pointsForAdvancing: 0,
        });
        break;
    }
    
    setStagePoints(stages);
  };

  const getKnockoutStages = (teams: number): string[] => {
    const stages: string[] = [];
    let currentRound = teams;
    
    // Build stages from first round to final
    while (currentRound >= 2) {
      if (currentRound === 2) stages.unshift('Final');
      else if (currentRound === 4) stages.unshift('Semi-finals');
      else if (currentRound === 8) stages.unshift('Quarter-finals');
      else if (currentRound === 16) stages.unshift('Round of 16');
      else if (currentRound === 32) stages.unshift('Round of 32');
      else stages.unshift(`Round of ${currentRound}`);
      
      currentRound = Math.floor(currentRound / 2);
    }
    
    return stages;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        showToast('Please enter a name for the point system', 'error');
        return;
      }
      if (numberOfTeams < 2) {
        showToast('Number of teams must be at least 2', 'error');
        return;
      }
    }
    
    if (currentStep === 2) {
      generateStages();
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const updateStagePoint = (index: number, field: keyof StageConfig, value: string | number) => {
    const updated = [...stagePoints];
    updated[index] = { ...updated[index], [field]: value };
    setStagePoints(updated);
  };

  const addCustomStage = () => {
    setStagePoints([...stagePoints, {
      stageName: `Stage ${stagePoints.length + 1}`,
      stageOrder: stagePoints.length + 1,
      pointsForWin: basePoints.pointsPerWin,
      pointsForDraw: basePoints.pointsPerDraw,
      pointsForLoss: basePoints.pointsPerLoss,
      pointsForAdvancing: 0,
    }]);
  };

  const removeStage = (index: number) => {
    const updated = stagePoints.filter((_, i) => i !== index);
    // Reorder remaining stages
    updated.forEach((stage, i) => {
      stage.stageOrder = i + 1;
    });
    setStagePoints(updated);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/point-systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          tournamentType,
          numberOfTeams,
          ...basePoints,
          stagePoints,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to create point system', 'error');
        return;
      }

      showToast('Point system created successfully!', 'success');
      router.push('/dashboard/point-systems');
      router.refresh();
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                currentStep >= step 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              <div className="flex-1 mx-4">
                <div className={`h-1 rounded ${
                  currentStep > step ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-200'
                }`} />
              </div>
            </div>
          ))}
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
            currentStep >= 3 
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            ✓
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Tournament Setup
          </span>
          <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Base Points
          </span>
          <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Stage Configuration
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament Setup</h2>
              <p className="text-gray-600">Configure the basic tournament structure and format</p>
            </div>

            <Input
              label="Point System Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Premier League 2024"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                rows={3}
                placeholder="Describe this point system..."
              />
            </div>

            <Select
              label="Tournament Type"
              value={tournamentType}
              onChange={(e) => setTournamentType(e.target.value as TournamentType)}
              options={[
                { value: 'LEAGUE', label: '🏆 League (Round-robin)' },
                { value: 'KNOCKOUT', label: '⚔️ Knockout (Elimination)' },
                { value: 'GROUP_STAGE', label: '👥 Group Stage Only' },
                { value: 'GROUP_KNOCKOUT', label: '🎯 Group + Knockout' },
                { value: 'LEAGUE_KNOCKOUT', label: '🏅 League + Knockout' },
                { value: 'MIXED', label: '🔀 Mixed (Custom)' },
              ]}
            />

            <Input
              label="Number of Teams"
              type="number"
              min="2"
              max="64"
              value={numberOfTeams.toString()}
              onChange={(e) => setNumberOfTeams(parseInt(e.target.value) || 2)}
              helperText="Total number of participating teams"
              required
            />

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Tournament Type Guide:</p>
                  <ul className="space-y-1 text-xs">
                    <li><strong>League:</strong> All teams play each other</li>
                    <li><strong>Knockout:</strong> Single elimination format</li>
                    <li><strong>Group Stage:</strong> Teams divided into groups</li>
                    <li><strong>Group + Knockout:</strong> Groups followed by elimination</li>
                    <li><strong>League + Knockout:</strong> League followed by playoffs</li>
                    <li><strong>Mixed:</strong> Custom stages you define</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Base Point Configuration</h2>
              <p className="text-gray-600">Set default points for match outcomes and events</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Points Per Win"
                type="number"
                value={basePoints.pointsPerWin.toString()}
                onChange={(e) => setBasePoints({...basePoints, pointsPerWin: parseInt(e.target.value) || 0})}
              />
              <Input
                label="Points Per Draw"
                type="number"
                value={basePoints.pointsPerDraw.toString()}
                onChange={(e) => setBasePoints({...basePoints, pointsPerDraw: parseInt(e.target.value) || 0})}
              />
              <Input
                label="Points Per Loss"
                type="number"
                value={basePoints.pointsPerLoss.toString()}
                onChange={(e) => setBasePoints({...basePoints, pointsPerLoss: parseInt(e.target.value) || 0})}
              />
              <Input
                label="Points Per Goal Scored"
                type="number"
                value={basePoints.pointsPerGoalScored.toString()}
                onChange={(e) => setBasePoints({...basePoints, pointsPerGoalScored: parseInt(e.target.value) || 0})}
              />
              <Input
                label="Points Per Goal Conceded"
                type="number"
                value={basePoints.pointsPerGoalConceded.toString()}
                onChange={(e) => setBasePoints({...basePoints, pointsPerGoalConceded: parseInt(e.target.value) || 0})}
              />
              <Input
                label="Points for Walkover Win"
                type="number"
                value={basePoints.pointsForWalkoverWin.toString()}
                onChange={(e) => setBasePoints({...basePoints, pointsForWalkoverWin: parseInt(e.target.value) || 0})}
                helperText="Points for team that receives walkover"
              />
              <Input
                label="Points for Walkover Loss"
                type="number"
                value={basePoints.pointsForWalkoverLoss.toString()}
                onChange={(e) => setBasePoints({...basePoints, pointsForWalkoverLoss: parseInt(e.target.value) || 0})}
                helperText="Penalty for team that gives walkover (usually negative)"
              />
              <Input
                label="Points Per Clean Sheet"
                type="number"
                value={basePoints.pointsPerCleanSheet.toString()}
                onChange={(e) => setBasePoints({...basePoints, pointsPerCleanSheet: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Stage Configuration</h2>
                <p className="text-gray-600">Customize points for each tournament stage</p>
              </div>
              {tournamentType === 'MIXED' && (
                <button
                  onClick={addCustomStage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Stage
                </button>
              )}
            </div>

            <div className="space-y-4">
              {stagePoints.map((stage, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center justify-between mb-4">
                    <Input
                      label="Stage Name"
                      value={stage.stageName}
                      onChange={(e) => updateStagePoint(index, 'stageName', e.target.value)}
                      className="flex-1 mr-4"
                    />
                    {tournamentType === 'MIXED' && stagePoints.length > 1 && (
                      <button
                        onClick={() => removeStage(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Input
                      label="Win"
                      type="number"
                      value={stage.pointsForWin.toString()}
                      onChange={(e) => updateStagePoint(index, 'pointsForWin', parseInt(e.target.value) || 0)}
                    />
                    <Input
                      label="Draw"
                      type="number"
                      value={stage.pointsForDraw.toString()}
                      onChange={(e) => updateStagePoint(index, 'pointsForDraw', parseInt(e.target.value) || 0)}
                    />
                    <Input
                      label="Loss"
                      type="number"
                      value={stage.pointsForLoss.toString()}
                      onChange={(e) => updateStagePoint(index, 'pointsForLoss', parseInt(e.target.value) || 0)}
                    />
                    <Input
                      label="Advancing"
                      type="number"
                      value={stage.pointsForAdvancing.toString()}
                      onChange={(e) => updateStagePoint(index, 'pointsForAdvancing', parseInt(e.target.value) || 0)}
                      helperText="Bonus for advancing"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            Back
          </Button>
          
          {currentStep < 3 ? (
            <Button variant="primary" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Point System
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
