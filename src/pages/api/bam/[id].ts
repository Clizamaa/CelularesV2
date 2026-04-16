import type { APIRoute } from 'astro';
import { getBAMById, updateBAM, deleteBAM } from '@/lib/services/bam.service';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) return errorResponse(400, 'ID requerido');

    const bam = await getBAMById(id);
    if (!bam) return errorResponse(404, 'BAM no encontrada');

    return successResponse(bam);
  } catch (err) {
    return errorResponse(500, 'Error al obtener BAM');
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) return errorResponse(400, 'ID requerido');

    const body = await request.json();
    const updated = await updateBAM(id, body);

    return successResponse(updated);
  } catch (err: any) {
    console.error('[API] PATCH /api/bam/[id] error:', err);
    if (err?.code === 'P2002') {
      return errorResponse(409, 'El IMEI ya existe en el sistema');
    }
    return errorResponse(500, 'Error al actualizar BAM');
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) return errorResponse(400, 'ID requerido');

    await deleteBAM(id);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('[API] DELETE /api/bam/[id] error:', err);
    return errorResponse(500, 'Error al eliminar BAM');
  }
};
