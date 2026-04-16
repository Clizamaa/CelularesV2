import type { APIRoute } from 'astro';
import { getBAMs, createBAM } from '@/lib/services/bam.service';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ url }) => {
  try {
    const q = url.searchParams.get('q') ?? '';
    const estado = url.searchParams.get('estado') ?? undefined;
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const sort = url.searchParams.get('sort') ?? 'createdAt';
    const order = url.searchParams.get('order') ?? 'desc';

    const result = await getBAMs({ q, estado, page, limit, sort, order });

    return successResponse(result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (err) {
    console.error('[API] GET /api/bam error:', err);
    return errorResponse(500, 'Error al obtener BAMs');
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.marca || !body.modelo || !body.imei) {
      return errorResponse(400, 'Marca, modelo e IMEI son obligatorios');
    }

    if (body.imei.length !== 15) {
      return errorResponse(400, 'El IMEI debe tener 15 dígitos');
    }

    const bam = await createBAM(body);
    return successResponse(bam, undefined, 201);
  } catch (err: any) {
    console.error('[API] POST /api/bam error:', err);
    if (err?.code === 'P2002') {
      return errorResponse(409, 'El IMEI ya existe en el sistema');
    }
    return errorResponse(500, 'Error al crear BAM');
  }
};
