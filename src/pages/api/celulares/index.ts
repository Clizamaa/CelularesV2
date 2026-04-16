import type { APIRoute } from 'astro';
import { getCelulares, createCelular } from '@/lib/services/celulares.service';
import { celularSchema } from '@/lib/validations/celular.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ url }) => {
  try {
    const q = url.searchParams.get('q') ?? '';
    const estado = url.searchParams.get('estado') ?? undefined;
    const marca = url.searchParams.get('marca') ?? undefined;
    const modelo = url.searchParams.get('modelo') ?? undefined;
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const sort = url.searchParams.get('sort') ?? 'createdAt';
    const order = url.searchParams.get('order') ?? 'desc';

    const result = await getCelulares({ q, estado, marca, modelo, page, limit, sort, order });

    return successResponse(result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (err) {
    console.error('[API] GET /api/celulares error:', err);
    return errorResponse(500, 'Error al obtener celulares');
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = celularSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(400, 'Datos inválidos', parsed.error.issues);
    }

    const celular = await createCelular(parsed.data);
    return successResponse(celular, undefined, 201);
  } catch (err: any) {
    console.error('[API] POST /api/celulares error detail:', err);
    if (err?.code === 'P2002') {
      const field = err.meta?.target?.[0] ?? 'campo';
      return errorResponse(409, `El ${field} ya existe en el sistema`);
    }
    return errorResponse(500, `Error al crear celular: ${err.message || 'Error desconocido'}`);
  }
};
