import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: import.meta.env.DEV ? ['query', 'error', 'warn'] : ['error'],
  });

if (import.meta.env.DEV) globalForPrisma.prisma = prisma;
// Reload triggered at 2026-04-15 16:56
