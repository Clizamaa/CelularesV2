import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando borrado de equipos Galaxy a02 ---');
  
  const countBefore = await prisma.celular.count({
    where: {
      modelo: {
        contains: 'Galaxy a02',
        mode: 'insensitive'
      }
    }
  });

  console.log(`Se encontraron ${countBefore} equipos con el modelo "Galaxy a02".`);

  if (countBefore === 0) {
    console.log('No hay equipos para borrar.');
    return;
  }

  // Deleting assignments first if they exist (Prisma might handle this depending on schema, but let's be safe)
  // Actually, checking schema first is better.
  
  const deleted = await prisma.celular.deleteMany({
    where: {
      modelo: {
        contains: 'Galaxy a02',
        mode: 'insensitive'
      }
    }
  });

  console.log(`¡Éxito! Se han eliminado ${deleted.count} equipos.`);
}

main()
  .catch((e) => {
    console.error('Error durante el borrado:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
