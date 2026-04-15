import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando borrado de equipos Galaxy a02 ---');
  
  const countBefore = await prisma.celular.count({
    where: {
      modelo: {
        contains: 'Galaxy a02'
      }
    }
  });

  console.log(`Se encontraron ${countBefore} equipos con el modelo "Galaxy a02".`);

  if (countBefore === 0) {
    console.log('No hay equipos para borrar.');
    return;
  }

  const deleted = await prisma.celular.deleteMany({
    where: {
      modelo: {
        contains: 'Galaxy a02'
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
