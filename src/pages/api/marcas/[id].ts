import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ params }) => {
  try {
    const marca = await prisma.marca.findUnique({
      where: { id: params.id },
      include: {
        modelos: { orderBy: { nombre: 'asc' } },
      },
    });
    if (!marca) return errorResponse(404, 'Marca no encontrada');
    return successResponse(marca);
  } catch (err) {
    console.error('[API] GET /api/marcas/[id] error:', err);
    return errorResponse(500, 'Error al obtener marca');
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    const nombre = body.nombre?.trim();

    if (!nombre || nombre.length < 2) {
      return errorResponse(400, 'El nombre de la marca debe tener al menos 2 caracteres');
    }

    const existing = await prisma.marca.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse(404, 'Marca no encontrada');

    const marca = await prisma.marca.update({
      where: { id: params.id },
      data: { nombre },
      include: { modelos: true },
    });

    return successResponse(marca);
  } catch (err: any) {
    console.error('[API] PUT /api/marcas/[id] error:', err);
    if (err?.code === 'P2002') {
      return errorResponse(409, 'Ya existe una marca con ese nombre');
    }
    return errorResponse(500, 'Error al actualizar marca');
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const existing = await prisma.marca.findUnique({
      where: { id: params.id },
      include: { _count: { select: { modelos: true } } },
    });
    if (!existing) return errorResponse(404, 'Marca no encontrada');

    // Cascade delete will remove modelos automatically
    await prisma.marca.delete({ where: { id: params.id } });
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('[API] DELETE /api/marcas/[id] error:', err);
    return errorResponse(500, 'Error al eliminar marca');
  }
};
