import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function getCelulares(params: {
  q?: string;
  estado?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}) {
  const { q = '', estado, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = params;

  const where: Prisma.CelularWhereInput = {
    ...(estado && { estado: estado as any }),
    ...(q && {
      OR: [
        { marca: { contains: q } },
        { modelo: { contains: q } },
        { serial: { contains: q } },
        { imei: { contains: q } },
      ],
    }),
  };

  const orderBy: Prisma.CelularOrderByWithRelationInput = {
    [sort]: order as 'asc' | 'desc',
  };

  const [data, total] = await Promise.all([
    prisma.celular.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        asignacion: {
          include: { simcard: true },
        },
      },
      orderBy,
    }),
    prisma.celular.count({ where }),
  ]);

  return { data, total, page, pageSize: limit };
}

export async function getCelularById(id: string) {
  return prisma.celular.findUnique({
    where: { id },
    include: {
      asignacion: {
        include: { simcard: true },
      },
    },
  });
}

export async function createCelular(data: {
  marca: string;
  modelo: string;
  serial: string;
  imei: string;
  observaciones?: string;
  estado?: any;
}) {
  return prisma.celular.create({
    data: {
      ...data,
      id: crypto.randomUUID(),
    },
  });
}

export async function updateCelular(id: string, data: Prisma.CelularUpdateInput) {
  return prisma.celular.update({
    where: { id },
    data,
  });
}

export async function deleteCelular(id: string) {
  // Eliminar asignaciones relacionadas primero
  await prisma.asignacion.deleteMany({ where: { celularId: id } });
  return prisma.celular.delete({ where: { id } });
}
