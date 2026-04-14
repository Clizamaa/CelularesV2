import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ params }) => {
  try {
    const asignacion = await prisma.asignacion.findUnique({
      where: { id: params.id },
      include: { celular: true, simcard: true },
    });
    if (!asignacion) return errorResponse(404, 'Asignación no encontrada');
    return successResponse(asignacion);
  } catch (err) {
    console.error('[API] GET /api/asignaciones/[id] error:', err);
    return errorResponse(500, 'Error al obtener asignación');
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    const asignacion = await prisma.asignacion.findUnique({
      where: { id: params.id },
    });

    if (!asignacion) return errorResponse(404, 'Asignación no encontrada');

    const updated = await prisma.asignacion.update({
      where: { id: params.id },
      data: {
        funcionarioId: body.funcionarioId ?? asignacion.funcionarioId,
        funcionarioNombre: body.funcionarioNombre ?? asignacion.funcionarioNombre,
        observaciones: body.observaciones ?? asignacion.observaciones,
      },
      include: { celular: true, simcard: true },
    });

    return successResponse(updated);
  } catch (err) {
    console.error('[API] PUT /api/asignaciones/[id] error:', err);
    return errorResponse(500, 'Error al actualizar asignación');
  }
};

// DELETE = Liberar asignación (desactivar, no borrar)
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const asignacion = await prisma.asignacion.findUnique({
      where: { id: params.id },
      include: { celular: true, simcard: true },
    });

    if (!asignacion) return errorResponse(404, 'Asignación no encontrada');

    await prisma.$transaction(async (tx) => {
      // Desactivar asignación
      await tx.asignacion.update({
        where: { id: params.id },
        data: { activa: false, fechaDevolucion: new Date() },
      });

      // Liberar celular
      await tx.celular.update({
        where: { id: asignacion.celularId },
        data: { estado: 'DISPONIBLE' },
      });

      // Liberar SIM si tiene
      if (asignacion.simcardId) {
        await tx.simcard.update({
          where: { id: asignacion.simcardId },
          data: { estado: 'DISPONIBLE' },
        });
      }
    });

    return successResponse({ released: true });
  } catch (err) {
    console.error('[API] DELETE /api/asignaciones/[id] error:', err);
    return errorResponse(500, 'Error al liberar asignación');
  }
};
