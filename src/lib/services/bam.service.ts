import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function getBAMs(params: {
  q?: string;
  estado?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}) {
  const { q = '', estado, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = params;

  const where: Prisma.BAMWhereInput = {
    ...(estado && { estado: estado as any }),
    ...(q && {
      OR: [
        { marca: { contains: q } },
        { modelo: { contains: q } },
        { imei: { contains: q } },
      ],
    }),
  };

  const orderBy: Prisma.BAMOrderByWithRelationInput = {
    [sort]: order as 'asc' | 'desc',
  };

  const [data, total] = await Promise.all([
    prisma.bAM.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        asignacion: true,
      },
      orderBy,
    }),
    prisma.bAM.count({ where }),
  ]);

  return { data, total, page, pageSize: limit };
}

export async function getBAMById(id: string) {
  return prisma.bAM.findUnique({
    where: { id },
    include: {
      asignacion: true,
    },
  });
}

export async function createBAM(data: {
  marca: string;
  modelo: string;
  imei: string;
  observaciones?: string;
  estado?: any;
}) {
  return prisma.bAM.create({
    data: {
      marca: data.marca,
      modelo: data.modelo,
      imei: data.imei,
      observaciones: data.observaciones || '',
      estado: data.estado || 'DISPONIBLE',
    },
  });
}

export async function updateBAM(id: string, data: Prisma.BAMUpdateInput) {
  return prisma.bAM.update({
    where: { id },
    data,
  });
}

export async function deleteBAM(id: string) {
  await prisma.asignacionBAM.deleteMany({ where: { bamId: id } });
  return prisma.bAM.delete({ where: { id } });
}
