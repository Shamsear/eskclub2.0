import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySchema() {
  try {
    console.log('Verifying Point System schema...\n');

    // Check if we can access the new models
    console.log('✓ PointSystemTemplate model is available');
    console.log('✓ ConditionalRule model is available');
    
    // Check if Tournament has the new field
    const tournamentFields = Object.keys((prisma.tournament as any).fields || {});
    console.log('✓ Tournament model is available');
    
    // Try to query the tables (will fail if they don't exist)
    const templates = await prisma.pointSystemTemplate.findMany();
    console.log(`✓ point_system_templates table exists (found ${templates.length} templates)`);
    
    const rules = await prisma.conditionalRule.findMany();
    console.log(`✓ conditional_rules table exists (found ${rules.length} rules)`);
    
    const tournaments = await prisma.tournament.findMany({
      select: {
        id: true,
        name: true,
        pointSystemTemplateId: true,
      },
      take: 1,
    });
    console.log(`✓ tournaments.pointSystemTemplateId field exists`);
    
    console.log('\n✅ All schema changes verified successfully!');
  } catch (error) {
    console.error('❌ Schema verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySchema();
