import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async ({ url }) => {
  try {
    const marcaId = url.searchParams.get('marcaId');

    const where = marcaId ? { marcaId } : {};

    const modelos = await prisma.modelo.findMany({
      where,
      include: { marca: true },
      orderBy: { nombre: 'asc' },
    });

    return successResponse(modelos);
  } catch (err) {
    console.error('[API] GET /api/modelos error:', err);
    return errorResponse(500, 'Error al obtener modelos');
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const nombre = body.nombre?.trim();
    const marcaId = body.marcaId?.trim();

    if (!nombre || nombre.length < 1) {
      return errorResponse(400, 'El nombre del modelo es requerido');
    }

    if (nombre.length > 100) {
      return errorResponse(400, 'El nombre del modelo no puede exceder 100 caracteres');
    }

    if (!marcaId) {
      return errorResponse(400, 'La marca es requerida');
    }

    // Verify marca exists
    const marca = await prisma.marca.findUnique({ where: { id: marcaId } });
    if (!marca) return errorResponse(404, 'Marca no encontrada');

    const modelo = await prisma.modelo.create({
      data: {
        id: crypto.randomUUID(),
        nombre,
        marcaId,
      },
      include: { marca: true },
    });

    return successResponse(modelo, undefined, 201);
  } catch (err: any) {
    console.error('[API] POST /api/modelos error:', err);
    if (err?.code === 'P2002') {
      return errorResponse(409, 'Ya existe un modelo con ese nombre para esta marca');
    }
    return errorResponse(500, 'Error al crear modelo');
  }
};
