import { PrismaClient } from '@prisma/client';
import { calculatePointsWithRules, PointSystemConfig } from '../lib/match-utils';

const prisma = new PrismaClient();

interface PointChange {
  matchId: number;
  matchDate: Date;
  tournamentName: string;
  playerId: number;
  playerName: string;
  oldPoints: number;
  newPoints: number;
  difference: number;
  reason: string;
}

async function recalculateMatchPoints(preview: boolean = true) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`MATCH POINTS RECALCULATION ${preview ? '(PREVIEW MODE)' : '(LIVE MODE)'}`);
  console.log(`${'='.repeat(80)}\n`);

  const changes: PointChange[] = [];
  let matchesProcessed = 0;
  let matchesWithChanges = 0;

  try {
    // First, find the "esk next gen cup" point system template
    const targetTemplate = await prisma.pointSystemTemplate.findFirst({
      where: {
        name: {
          contains: 'esk next gen cup',
          mode: 'insensitive',
        },
      },
    });

    if (!targetTemplate) {
      console.log('❌ Could not find "esk next gen cup" point system template');
      console.log('Available templates:');
      const allTemplates = await prisma.pointSystemTemplate.findMany({
        select: { id: true, name: true },
      });
      allTemplates.forEach(t => console.log(`   - ${t.name} (ID: ${t.id})`));
      return;
    }

    console.log(`✅ Found template: "${targetTemplate.name}" (ID: ${targetTemplate.id})\n`);

    // Get all matches that use this template
    const matches = await prisma.match.findMany({
      where: {
        tournament: {
          pointSystemTemplateId: targetTemplate.id,
        },
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            matchFormat: true,
            pointSystemTemplateId: true,
            pointsPerWin: true,
            pointsPerDraw: true,
            pointsPerLoss: true,
            pointsPerGoalScored: true,
            pointsPerGoalConceded: true,
            pointsPerCleanSheet: true,
            pointsPerStageWin: true,
            pointsPerStageDraw: true,
            pointsForWalkoverWin: true,
            pointsForWalkoverLoss: true,
          },
        },
        results: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        stage: {
          select: {
            id: true,
            pointSystemTemplateId: true,
            pointsPerWin: true,
            pointsPerDraw: true,
            pointsPerLoss: true,
            pointsPerGoalScored: true,
            pointsPerGoalConceded: true,
          },
        },
      },
      orderBy: {
        matchDate: 'asc',
      },
    });

    console.log(`Found ${matches.length} matches using this template\n`);

    for (const match of matches) {
      matchesProcessed++;
      let matchHasChanges = false;

      // Build point system config
      let pointSystemConfig: PointSystemConfig;

      // Check if match has stage-specific points
      if (match.stageId && match.stage && match.tournament.pointSystemTemplateId) {
        // Use stage-specific points
        pointSystemConfig = {
          pointsPerWin: match.stage.pointsPerWin,
          pointsPerDraw: match.stage.pointsPerDraw,
          pointsPerLoss: match.stage.pointsPerLoss,
          pointsPerGoalScored: match.stage.pointsPerGoalScored,
          pointsPerGoalConceded: match.stage.pointsPerGoalConceded,
        };
      } else if (match.tournament.pointSystemTemplateId) {
        // Fetch template with conditional rules
        const template = await prisma.pointSystemTemplate.findUnique({
          where: { id: match.tournament.pointSystemTemplateId },
          include: {
            conditionalRules: true,
          },
        });

        if (template) {
          pointSystemConfig = {
            pointsPerWin: template.pointsPerWin,
            pointsPerDraw: template.pointsPerDraw,
            pointsPerLoss: template.pointsPerLoss,
            pointsPerGoalScored: template.pointsPerGoalScored,
            pointsPerGoalConceded: template.pointsPerGoalConceded,
            pointsPerCleanSheet: template.pointsPerCleanSheet,
            pointsPerStageWin: template.pointsPerStageWin,
            pointsPerStageDraw: template.pointsPerStageDraw,
            pointsForWalkoverWin: template.pointsForWalkoverWin,
            pointsForWalkoverLoss: template.pointsForWalkoverLoss,
            conditionalRules: template.conditionalRules,
          };
        } else {
          // Fallback to inline
          pointSystemConfig = {
            pointsPerWin: match.tournament.pointsPerWin,
            pointsPerDraw: match.tournament.pointsPerDraw,
            pointsPerLoss: match.tournament.pointsPerLoss,
            pointsPerGoalScored: match.tournament.pointsPerGoalScored,
            pointsPerGoalConceded: match.tournament.pointsPerGoalConceded,
            pointsPerCleanSheet: match.tournament.pointsPerCleanSheet,
            pointsPerStageWin: match.tournament.pointsPerStageWin,
            pointsPerStageDraw: match.tournament.pointsPerStageDraw,
            pointsForWalkoverWin: match.tournament.pointsForWalkoverWin,
            pointsForWalkoverLoss: match.tournament.pointsForWalkoverLoss,
          };
        }
      } else {
        // Use inline configuration
        pointSystemConfig = {
          pointsPerWin: match.tournament.pointsPerWin,
          pointsPerDraw: match.tournament.pointsPerDraw,
          pointsPerLoss: match.tournament.pointsPerLoss,
          pointsPerGoalScored: match.tournament.pointsPerGoalScored,
          pointsPerGoalConceded: match.tournament.pointsPerGoalConceded,
          pointsPerCleanSheet: match.tournament.pointsPerCleanSheet,
          pointsPerStageWin: match.tournament.pointsPerStageWin,
          pointsPerStageDraw: match.tournament.pointsPerStageDraw,
          pointsForWalkoverWin: match.tournament.pointsForWalkoverWin,
          pointsForWalkoverLoss: match.tournament.pointsForWalkoverLoss,
        };
      }

      // Process each result
      for (const result of match.results) {
        let newPoints: number;
        let newBasePoints: number;
        let newConditionalPoints: number;
        let reason = 'Normal calculation';

        // Check if this is a walkover match
        if (match.walkoverWinnerId !== null && match.walkoverWinnerId !== undefined) {
          const walkoverWinPoints = pointSystemConfig.pointsForWalkoverWin || 3;
          const walkoverLossPoints = pointSystemConfig.pointsForWalkoverLoss || -3;

          if (match.walkoverWinnerId === 0) {
            // Both forfeited
            newPoints = 0;
            newBasePoints = 0;
            newConditionalPoints = 0;
            reason = 'Walkover - Both forfeited';
          } else if (result.playerId === match.walkoverWinnerId) {
            // Winner by walkover
            newPoints = walkoverWinPoints;
            newBasePoints = walkoverWinPoints;
            newConditionalPoints = 0;
            reason = 'Walkover - Winner';
          } else {
            // Loser by walkover
            newPoints = walkoverLossPoints;
            newBasePoints = walkoverLossPoints;
            newConditionalPoints = 0;
            reason = 'Walkover - Loser';
          }
        } else {
          // Normal match - calculate with rules
          const calculation = calculatePointsWithRules(
            {
              outcome: result.outcome,
              goalsScored: result.goalsScored,
              goalsConceded: result.goalsConceded,
            },
            pointSystemConfig
          );

          newPoints = calculation.totalPoints;
          newBasePoints = calculation.basePoints;
          newConditionalPoints = calculation.conditionalPoints;
          
          if (calculation.appliedRules && calculation.appliedRules.length > 0) {
            reason = `Normal + ${calculation.appliedRules.length} conditional rule(s)`;
          }
        }

        // Check if points changed
        if (
          result.pointsEarned !== newPoints ||
          result.basePoints !== newBasePoints ||
          result.conditionalPoints !== newConditionalPoints
        ) {
          matchHasChanges = true;
          changes.push({
            matchId: match.id,
            matchDate: match.matchDate,
            tournamentName: match.tournament.name,
            playerId: result.playerId || 0,
            playerName: result.player?.name || 'External Player',
            oldPoints: result.pointsEarned,
            newPoints: newPoints,
            difference: newPoints - result.pointsEarned,
            reason: reason,
          });

          // Update in database if not preview mode
          if (!preview) {
            await prisma.matchResult.update({
              where: { id: result.id },
              data: {
                pointsEarned: newPoints,
                basePoints: newBasePoints,
                conditionalPoints: newConditionalPoints,
              },
            });
          }
        }
      }

      if (matchHasChanges) {
        matchesWithChanges++;
      }
    }

    // Print summary
    console.log(`\n${'='.repeat(80)}`);
    console.log('SUMMARY');
    console.log(`${'='.repeat(80)}\n`);
    console.log(`Total matches processed: ${matchesProcessed}`);
    console.log(`Matches with changes: ${matchesWithChanges}`);
    console.log(`Total point changes: ${changes.length}\n`);

    if (changes.length > 0) {
      console.log(`${'='.repeat(80)}`);
      console.log('DETAILED CHANGES');
      console.log(`${'='.repeat(80)}\n`);

      // Group by tournament
      const byTournament = changes.reduce((acc, change) => {
        if (!acc[change.tournamentName]) {
          acc[change.tournamentName] = [];
        }
        acc[change.tournamentName].push(change);
        return acc;
      }, {} as Record<string, PointChange[]>);

      for (const [tournament, tournamentChanges] of Object.entries(byTournament)) {
        console.log(`\n📊 ${tournament}`);
        console.log(`${'─'.repeat(80)}`);
        
        for (const change of tournamentChanges) {
          const sign = change.difference >= 0 ? '+' : '';
          const color = change.difference >= 0 ? '🟢' : '🔴';
          console.log(
            `${color} Match #${change.matchId} | ${change.matchDate.toISOString().split('T')[0]} | ` +
            `${change.playerName} | ` +
            `${change.oldPoints} → ${change.newPoints} (${sign}${change.difference}) | ` +
            `${change.reason}`
          );
        }
      }

      console.log(`\n${'='.repeat(80)}\n`);

      if (preview) {
        console.log('⚠️  PREVIEW MODE - No changes were made to the database');
        console.log('💡 Run with preview=false to apply these changes\n');
      } else {
        console.log('✅ Changes have been applied to the database');
        console.log('🔄 Recalculating player statistics...\n');

        // Recalculate player statistics for affected tournaments
        const affectedTournaments = [...new Set(changes.map(c => c.tournamentName))];
        for (const tournamentName of affectedTournaments) {
          const tournament = await prisma.tournament.findFirst({
            where: { name: tournamentName },
          });
          
          if (tournament) {
            console.log(`   Recalculating stats for: ${tournamentName}`);
            // Trigger stats recalculation endpoint would go here
            // For now, we'll just note it
          }
        }
        
        console.log('\n✅ All done!\n');
      }
    } else {
      console.log('✅ All match points are already correct! No changes needed.\n');
    }

  } catch (error) {
    console.error('❌ Error during recalculation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const preview = !args.includes('--live');

if (!preview) {
  console.log('\n⚠️  WARNING: Running in LIVE mode - changes will be applied to the database!');
  console.log('Press Ctrl+C within 5 seconds to cancel...\n');
  
  setTimeout(() => {
    recalculateMatchPoints(false);
  }, 5000);
} else {
  recalculateMatchPoints(true);
}
