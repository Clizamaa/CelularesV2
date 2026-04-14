import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const marcas = await prisma.marca.findMany({
    include: { modelos: true }
  });
  console.log(JSON.stringify(marcas, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
