import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    const nombre = body.nombre?.trim();

    if (!nombre || nombre.length < 1) {
      return errorResponse(400, 'El nombre del modelo es requerido');
    }

    const existing = await prisma.modelo.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse(404, 'Modelo no encontrado');

    const modelo = await prisma.modelo.update({
      where: { id: params.id },
      data: { nombre },
      include: { marca: true },
    });

    return successResponse(modelo);
  } catch (err: any) {
    console.error('[API] PUT /api/modelos/[id] error:', err);
    if (err?.code === 'P2002') {
      return errorResponse(409, 'Ya existe un modelo con ese nombre para esta marca');
    }
    return errorResponse(500, 'Error al actualizar modelo');
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const existing = await prisma.modelo.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse(404, 'Modelo no encontrado');

    await prisma.modelo.delete({ where: { id: params.id } });
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('[API] DELETE /api/modelos/[id] error:', err);
    return errorResponse(500, 'Error al eliminar modelo');
  }
};
