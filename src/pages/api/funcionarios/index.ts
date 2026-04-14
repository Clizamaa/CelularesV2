import type { APIRoute } from 'astro';
import { buscarFuncionarios } from '@/lib/services/funcionarios.service';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ url }) => {
  try {
    const q = url.searchParams.get('q') ?? '';

    if (!q || q.length < 2) {
      return successResponse([]);
    }

    const funcionarios = await buscarFuncionarios(q);
    return successResponse(funcionarios);
  } catch (err) {
    console.error('[API] GET /api/funcionarios error:', err);
    return errorResponse(500, 'Error al buscar funcionarios');
  }
};
