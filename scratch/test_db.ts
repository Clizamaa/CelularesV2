import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- DB Check ---');
    const count = await prisma.computador.count();
    console.log('Computadores count:', count);
    
    // Try to find many
    const comps = await prisma.computador.findMany({
      include: { asignaciones: true }
    });
    console.log('Computadores found:', comps.length);
    console.log('Success!');
  } catch (err) {
    console.error('ERROR in DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
