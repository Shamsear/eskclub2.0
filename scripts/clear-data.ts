/**
 * Script to clear all data from the database
 * WARNING: This will delete ALL data from ALL tables
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️  Starting database cleanup...\n');

  try {
    // Delete in order to respect foreign key constraints
    console.log('Deleting match results...');
    const matchResults = await prisma.matchResult.deleteMany({});
    console.log(`  ✓ Deleted ${matchResults.count} match results`);
    
    console.log('Deleting matches...');
    const matches = await prisma.match.deleteMany({});
    console.log(`  ✓ Deleted ${matches.count} matches`);
    
    console.log('Deleting tournament player stats...');
    const stats = await prisma.tournamentPlayerStats.deleteMany({});
    console.log(`  ✓ Deleted ${stats.count} tournament player stats`);
    
    console.log('Deleting tournament participants...');
    const participants = await prisma.tournamentParticipant.deleteMany({});
    console.log(`  ✓ Deleted ${participants.count} tournament participants`);
    
    console.log('Deleting tournaments...');
    const tournaments = await prisma.tournament.deleteMany({});
    console.log(`  ✓ Deleted ${tournaments.count} tournaments`);
    
    console.log('Deleting conditional rules...');
    const rules = await prisma.conditionalRule.deleteMany({});
    console.log(`  ✓ Deleted ${rules.count} conditional rules`);
    
    console.log('Deleting point system templates...');
    const templates = await prisma.pointSystemTemplate.deleteMany({});
    console.log(`  ✓ Deleted ${templates.count} point system templates`);
    
    console.log('Deleting player roles...');
    const roles = await prisma.playerRole.deleteMany({});
    console.log(`  ✓ Deleted ${roles.count} player roles`);
    
    console.log('Deleting players...');
    const players = await prisma.player.deleteMany({});
    console.log(`  ✓ Deleted ${players.count} players`);
    
    console.log('Deleting clubs...');
    const clubs = await prisma.club.deleteMany({});
    console.log(`  ✓ Deleted ${clubs.count} clubs`);
    
    console.log('\n✅ Database cleared successfully!');
    console.log('All data has been removed from the database.\n');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
