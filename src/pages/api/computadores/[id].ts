import type { APIRoute } from 'astro';
import { getComputadorById, updateComputador, deleteComputador } from '@/lib/services/computadores.service';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ params }) => {
  try {
    const computador = await getComputadorById(params.id!);
    if (!computador) return errorResponse(404, 'Computador no encontrado');
    return successResponse(computador);
  } catch (err) {
    console.error('[API] GET /api/computadores/[id] error:', err);
    return errorResponse(500, 'Error al obtener computador');
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const existing = await getComputadorById(params.id!);
    if (!existing) return errorResponse(404, 'Computador no encontrado');

    await deleteComputador(params.id!);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('[API] DELETE /api/computadores/[id] error:', err);
    return errorResponse(500, 'Error interno al intentar eliminar el computador');
  }
};
