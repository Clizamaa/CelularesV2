import { prisma as globalPrisma } from '@/lib/prisma';
import { PrismaClient, type Prisma } from '@prisma/client';

export async function getCelulares(params: {
  q?: string;
  estado?: string;
  marca?: string;
  modelo?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}) {
  const { q = '', estado, marca, modelo, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = params;

  const where: Prisma.CelularWhereInput = {
    ...(estado && { estado: estado as any }),
    ...(marca && { marca }),
    ...(modelo && { modelo }),
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
    globalPrisma.celular.findMany({
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
    globalPrisma.celular.count({ where }),
  ]);

  return { data, total, page, pageSize: limit };
}

export async function getCelularById(id: string) {
  return globalPrisma.celular.findUnique({
    where: { id },
    include: {
      asignacion: {
        include: { simcard: true },
      },
    },
  });
}

export async function createCelular(input: {
  marca: string;
  modelo: string;
  serial?: string | null;
  imei: string;
  observaciones?: string;
  estado?: any;
}) {
  const tempPrisma = new PrismaClient();
  
  try {
    let finalSerial = input.serial?.trim();

    if (!finalSerial) {
      // Generate correlative 00001, 00002...
      // We look for serials that are purely numeric and 5 digits
      const lastCelulares = await tempPrisma.celular.findMany({
        where: {
          serial: {
            not: null,
            // Simple check for numeric serials of length 5
            // MySQL regex: ^[0-9]{5}$
          }
        },
        select: { serial: true }
      });

      const numericSerials = lastCelulares
        .map(c => parseInt(c.serial!))
        .filter(n => !isNaN(n) && n < 100000);

      const nextNumber = numericSerials.length > 0 ? Math.max(...numericSerials) + 1 : 1;
      finalSerial = nextNumber.toString().padStart(5, '0');
    }

    return await tempPrisma.celular.create({
      data: {
        marca: input.marca,
        modelo: input.modelo,
        serial: finalSerial,
        imei: input.imei,
        observaciones: input.observaciones || '',
        estado: input.estado || 'DISPONIBLE',
      },
    });
  } finally {
    await tempPrisma.$disconnect();
  }
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
