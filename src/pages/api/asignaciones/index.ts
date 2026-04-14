import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { asignacionSchema } from '@/lib/validations/simcard.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ url }) => {
  try {
    const activa = url.searchParams.get('activa');
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 10);

    const where = {
      ...(activa !== null && activa !== undefined && activa !== '' && { activa: activa === 'true' }),
    };

    const [data, total] = await Promise.all([
      prisma.asignacion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { celular: true, simcard: true },
        orderBy: { fechaAsignacion: 'desc' },
      }),
      prisma.asignacion.count({ where }),
    ]);

    return successResponse(data, { total, page, pageSize: limit });
  } catch (err) {
    console.error('[API] GET /api/asignaciones error:', err);
    return errorResponse(500, 'Error al obtener asignaciones');
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = asignacionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(400, 'Datos inválidos', parsed.error.issues);
    }

    const { celularId, simcardId, funcionarioId, funcionarioNombre, observaciones } = parsed.data;

    // Verificar que el celular existe y está disponible
    const celular = await prisma.celular.findUnique({
      where: { id: celularId },
      include: { asignacion: true },
    });

    if (!celular) return errorResponse(404, 'Celular no encontrado');
    if (celular.asignacion?.activa) {
      return errorResponse(409, 'El celular ya tiene una asignación activa');
    }

    // Si se incluye SIM, verificar que existe y está disponible
    if (simcardId) {
      const simcard = await prisma.simcard.findUnique({
        where: { id: simcardId },
        include: { asignacion: true },
      });
      if (!simcard) return errorResponse(404, 'SIM card no encontrada');
      if (simcard.asignacion?.activa) {
        return errorResponse(409, 'La SIM card ya tiene una asignación activa');
      }
    }

    // Crear asignación en transacción
    const asignacion = await prisma.$transaction(async (tx) => {
      // Desactivar asignación anterior si existe
      if (celular.asignacion) {
        await tx.asignacion.update({
          where: { id: celular.asignacion.id },
          data: { activa: false, fechaDevolucion: new Date() },
        });
      }

      // Crear nueva asignación
      const nueva = await tx.asignacion.create({
        data: {
          id: crypto.randomUUID(),
          celularId,
          simcardId: simcardId || null,
          funcionarioId: funcionarioId || null,
          funcionarioNombre: funcionarioNombre || null,
          observaciones: observaciones || null,
        },
        include: { celular: true, simcard: true },
      });

      // Actualizar estado del celular
      await tx.celular.update({
        where: { id: celularId },
        data: { estado: 'ASIGNADO' },
      });

      // Actualizar estado de la SIM si aplica
      if (simcardId) {
        await tx.simcard.update({
          where: { id: simcardId },
          data: { estado: 'ASIGNADA' },
        });
      }

      return nueva;
    });

    return successResponse(asignacion, undefined, 201);
  } catch (err) {
    console.error('[API] POST /api/asignaciones error:', err);
    return errorResponse(500, 'Error al crear asignación');
  }
};
