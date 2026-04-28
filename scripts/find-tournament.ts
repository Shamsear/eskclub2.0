import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findTournament() {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        name: {
          contains: 'esk next gen cup',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        pointSystemTemplateId: true,
      },
    });

    console.log('\nTournaments matching "esk next gen cup":');
    tournaments.forEach(t => {
      console.log(`  ID: ${t.id} | Name: ${t.name} | Template ID: ${t.pointSystemTemplateId}`);
    });
    console.log('');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findTournament();
