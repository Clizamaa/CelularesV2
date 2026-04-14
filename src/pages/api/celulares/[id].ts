import type { APIRoute } from 'astro';
import { getCelularById, updateCelular, deleteCelular } from '@/lib/services/celulares.service';
import { celularUpdateSchema } from '@/lib/validations/celular.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ params }) => {
  try {
    const celular = await getCelularById(params.id!);
    if (!celular) return errorResponse(404, 'Celular no encontrado');
    return successResponse(celular);
  } catch (err) {
    console.error('[API] GET /api/celulares/[id] error:', err);
    return errorResponse(500, 'Error al obtener celular');
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    const parsed = celularUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(400, 'Datos inválidos', parsed.error.issues);
    }

    const existing = await getCelularById(params.id!);
    if (!existing) return errorResponse(404, 'Celular no encontrado');

    const celular = await updateCelular(params.id!, parsed.data);
    return successResponse(celular);
  } catch (err: any) {
    console.error('[API] PUT /api/celulares/[id] error:', err);
    if (err?.code === 'P2002') {
      const field = err.meta?.target?.[0] ?? 'campo';
      return errorResponse(409, `El ${field} ya existe en el sistema`);
    }
    return errorResponse(500, 'Error al actualizar celular');
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const existing = await getCelularById(params.id!);
    if (!existing) return errorResponse(404, 'Celular no encontrado');

    await deleteCelular(params.id!);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('[API] DELETE /api/celulares/[id] error:', err);
    return errorResponse(500, 'Error al eliminar celular');
  }
};
