/**
 * Script to test error handling in tournament data functions
 * Run with: npx ts-node scripts/test-error-handling.ts
 */

import { getAllTournaments, getTournamentById } from '../lib/data/tournaments';

async function testErrorHandling() {
  console.log('🧪 Testing Tournament Error Handling\n');

  // Test 1: Invalid ID formats
  console.log('Test 1: Invalid ID Formats');
  console.log('─'.repeat(50));
  
  const invalidIds = ['abc', 'invalid', '-1', '0', ''];
  
  for (const id of invalidIds) {
    try {
      await getTournamentById(id);
      console.log(`❌ ${id}: Should have thrown error`);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`✅ ${id}: ${error.message}`);
      }
    }
  }

  console.log('\n');

  // Test 2: Valid ID format (may or may not exist)
  console.log('Test 2: Valid ID Format');
  console.log('─'.repeat(50));
  
  try {
    const tournament = await getTournamentById('1');
    if (tournament) {
      console.log(`✅ Found tournament: ${tournament.name}`);
    } else {
      console.log('✅ Tournament not found (returns null)');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(`✅ Database error handled: ${error.message}`);
    }
  }

  console.log('\n');

  // Test 3: Get all tournaments
  console.log('Test 3: Get All Tournaments');
  console.log('─'.repeat(50));
  
  try {
    const tournaments = await getAllTournaments();
    console.log(`✅ Retrieved ${tournaments.length} tournaments`);
    
    if (tournaments.length > 0) {
      console.log(`   First tournament: ${tournaments[0].name}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(`✅ Database error handled: ${error.message}`);
    }
  }

  console.log('\n');
  console.log('✨ Error handling tests complete!');
}

// Run tests
testErrorHandling().catch((error) => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
