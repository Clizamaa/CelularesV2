import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function getSimcards(params: {
  q?: string;
  estado?: string;
  page?: number;
  limit?: number;
}) {
  const { q = '', estado, page = 1, limit = 10 } = params;

  const where: Prisma.SimcardWhereInput = {
    ...(estado && { estado: estado as any }),
    ...(q && {
      OR: [
        { numeroSimcard: { contains: q } },
        { numeroTelefono: { contains: q } },
        { operador: { contains: q } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.simcard.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        asignacion: {
          include: { celular: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.simcard.count({ where }),
  ]);

  return { data, total, page, pageSize: limit };
}

export async function getSimcardById(id: string) {
  return prisma.simcard.findUnique({
    where: { id },
    include: {
      asignacion: {
        include: { celular: true },
      },
    },
  });
}

export async function createSimcard(data: {
  numeroSimcard: string;
  numeroTelefono?: string;
  operador?: string;
  observaciones?: string;
  estado?: any;
}) {
  return prisma.simcard.create({
    data: {
      ...data,
      id: crypto.randomUUID(),
    },
  });
}

export async function updateSimcard(id: string, data: Prisma.SimcardUpdateInput) {
  return prisma.simcard.update({
    where: { id },
    data,
  });
}

export async function deleteSimcard(id: string) {
  await prisma.asignacion.deleteMany({ where: { simcardId: id } });
  return prisma.simcard.delete({ where: { id } });
}
