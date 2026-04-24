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

export async function updateCelular(id: string, data: any) {
  const { simcardId, ...celularData } = data;

  return await globalPrisma.$transaction(async (tx) => {
    // 1. Actualizar datos básicos del celular
    const updated = await tx.celular.update({
      where: { id },
      data: celularData,
    });

    // 2. Manejar asignación de SIM si se proporcionó simcardId
    // simcardId === null o "" significa desvincular SIM
    if (simcardId !== undefined) {
      const activeAsig = await tx.asignacion.findFirst({
        where: { celularId: id, activa: true },
      });

      if (simcardId) {
        // Queremos asignar una SIM específica
        if (activeAsig) {
          // Si ya tenía otra SIM, liberamos la anterior
          if (activeAsig.simcardId && activeAsig.simcardId !== simcardId) {
            await tx.simcard.update({
              where: { id: activeAsig.simcardId },
              data: { estado: 'DISPONIBLE' },
            });
          }

          // Actualizamos la asignación actual
          await tx.asignacion.update({
            where: { id: activeAsig.id },
            data: { simcardId },
          });
        } else {
          // No hay asignación activa, creamos una para vincular la SIM al equipo
          await tx.asignacion.create({
            data: {
              celularId: id,
              simcardId,
              activa: true,
            },
          });
        }

        // Marcamos la nueva SIM como ASIGNADA
        await tx.simcard.update({
          where: { id: simcardId },
          data: { estado: 'ASIGNADA' },
        });
      } else {
        // Se envió simcardId vacío o null -> Desvincular SIM actual
        if (activeAsig?.simcardId) {
          await tx.simcard.update({
            where: { id: activeAsig.simcardId },
            data: { estado: 'DISPONIBLE' },
          });

          await tx.asignacion.update({
            where: { id: activeAsig.id },
            data: { simcardId: null },
          });
        }
      }
    }

    return updated;
  });
}

export async function deleteCelular(id: string) {
  return await globalPrisma.$transaction(async (tx) => {
    // 1. Encontrar todas las asignaciones para liberar las SIMs
    const asignaciones = await tx.asignacion.findMany({
      where: { celularId: id },
      select: { simcardId: true },
    });

    const simcardIds = asignaciones
      .map((a) => a.simcardId)
      .filter((sid): sid is string => !!sid);

    if (simcardIds.length > 0) {
      await tx.simcard.updateMany({
        where: { id: { in: simcardIds } },
        data: { estado: 'DISPONIBLE' },
      });
    }

    // 2. Eliminar asignaciones relacionadas
    await tx.asignacion.deleteMany({ where: { celularId: id } });

    // 3. Eliminar el celular
    return await tx.celular.delete({ where: { id } });
  });
}
