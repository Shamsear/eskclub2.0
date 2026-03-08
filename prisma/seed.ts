import { PrismaClient, RoleType, MatchOutcome } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create point system templates
  const standardTemplate = await prisma.pointSystemTemplate.upsert({
    where: { name: 'Standard Football Scoring' },
    update: {},
    create: {
      name: 'Standard Football Scoring',
      description: 'Traditional 3-1-0 point system for football/soccer',
      tournamentType: 'LEAGUE',
      numberOfTeams: 0,
      pointsPerWin: 3,
      pointsPerDraw: 1,
      pointsPerLoss: 0,
      pointsPerGoalScored: 0,
      pointsPerGoalConceded: 0,
      pointsForWalkoverWin: 3,
      pointsForWalkoverLoss: 0,
    },
  });
  console.log('Created point system template:', standardTemplate.name);

  const goalBasedTemplate = await prisma.pointSystemTemplate.upsert({
    where: { name: 'Goal-Based Scoring' },
    update: {},
    create: {
      name: 'Goal-Based Scoring',
      description: 'Points awarded for wins plus bonus points for goals',
      tournamentType: 'LEAGUE',
      numberOfTeams: 0,
      pointsPerWin: 3,
      pointsPerDraw: 1,
      pointsPerLoss: 0,
      pointsPerGoalScored: 1,
      pointsPerGoalConceded: -1,
      pointsForWalkoverWin: 3,
      pointsForWalkoverLoss: 0,
    },
  });
  console.log('Created point system template:', goalBasedTemplate.name);

  const winOnlyTemplate = await prisma.pointSystemTemplate.upsert({
    where: { name: 'Win-Only System' },
    update: {},
    create: {
      name: 'Win-Only System',
      description: 'Simple system where only wins count',
      tournamentType: 'KNOCKOUT',
      numberOfTeams: 0,
      pointsPerWin: 1,
      pointsPerDraw: 0,
      pointsPerLoss: 0,
      pointsPerGoalScored: 0,
      pointsPerGoalConceded: 0,
      pointsForWalkoverWin: 1,
      pointsForWalkoverLoss: 0,
    },
  });
  console.log('Created point system template:', winOnlyTemplate.name);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
