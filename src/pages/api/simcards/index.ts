import type { APIRoute } from 'astro';
import { getSimcards, createSimcard } from '@/lib/services/simcards.service';
import { simcardSchema } from '@/lib/validations/simcard.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ url }) => {
  try {
    const q = url.searchParams.get('q') ?? '';
    const estado = url.searchParams.get('estado') ?? undefined;
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 10);

    const result = await getSimcards({ q, estado, page, limit });

    return successResponse(result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (err) {
    console.error('[API] GET /api/simcards error:', err);
    return errorResponse(500, 'Error al obtener SIM cards');
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = simcardSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(400, 'Datos inválidos', parsed.error.issues);
    }

    const simcard = await createSimcard(parsed.data);
    return successResponse(simcard, undefined, 201);
  } catch (err: any) {
    console.error('[API] POST /api/simcards error:', err);
    if (err?.code === 'P2002') {
      return errorResponse(409, 'El número de SIM ya existe en el sistema');
    }
    return errorResponse(500, 'Error al crear SIM card');
  }
};
