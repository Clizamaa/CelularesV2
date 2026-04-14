import type { APIRoute } from 'astro';
import { getSimcardById, updateSimcard, deleteSimcard } from '@/lib/services/simcards.service';
import { simcardUpdateSchema } from '@/lib/validations/simcard.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ params }) => {
  try {
    const simcard = await getSimcardById(params.id!);
    if (!simcard) return errorResponse(404, 'SIM card no encontrada');
    return successResponse(simcard);
  } catch (err) {
    console.error('[API] GET /api/simcards/[id] error:', err);
    return errorResponse(500, 'Error al obtener SIM card');
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    const parsed = simcardUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(400, 'Datos inválidos', parsed.error.issues);
    }

    const existing = await getSimcardById(params.id!);
    if (!existing) return errorResponse(404, 'SIM card no encontrada');

    const simcard = await updateSimcard(params.id!, parsed.data);
    return successResponse(simcard);
  } catch (err: any) {
    console.error('[API] PUT /api/simcards/[id] error:', err);
    if (err?.code === 'P2002') {
      return errorResponse(409, 'El número de SIM ya existe en el sistema');
    }
    return errorResponse(500, 'Error al actualizar SIM card');
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const existing = await getSimcardById(params.id!);
    if (!existing) return errorResponse(404, 'SIM card no encontrada');

    await deleteSimcard(params.id!);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('[API] DELETE /api/simcards/[id] error:', err);
    return errorResponse(500, 'Error al eliminar SIM card');
  }
};
