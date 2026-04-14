import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const serial = 'TEST' + Math.floor(Math.random() * 10000);
  console.log('--- DB Write Test ---');
  console.log('Attempting to create Computador with serial:', serial);
  
  try {
    const computador = await prisma.computador.create({
      data: {
        marca: 'Test Brand',
        modelo: 'Test Model',
        serial: serial,
        estado: 'DISPONIBLE'
      }
    });
    console.log('SUCCESS! Created ID:', computador.id);
    
    // Clean up
    await prisma.computador.delete({ where: { id: computador.id } });
    console.log('Cleaned up test record.');
  } catch (err) {
    console.error('FAILED to write to DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
