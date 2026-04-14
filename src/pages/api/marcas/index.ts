import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const GET: APIRoute = async () => {
  try {
    const marcas = await prisma.marca.findMany({
      include: {
        modelos: {
          orderBy: { nombre: 'asc' },
        },
        _count: { select: { modelos: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    return successResponse(marcas);
  } catch (err) {
    console.error('[API] GET /api/marcas error:', err);
    return errorResponse(500, 'Error al obtener marcas');
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const nombre = body.nombre?.trim();

    if (!nombre || nombre.length < 2) {
      return errorResponse(400, 'El nombre de la marca debe tener al menos 2 caracteres');
    }

    if (nombre.length > 50) {
      return errorResponse(400, 'El nombre de la marca no puede exceder 50 caracteres');
    }

    const marca = await prisma.marca.create({
      data: {
        id: crypto.randomUUID(),
        nombre,
      },
      include: { modelos: true },
    });

    return successResponse(marca, undefined, 201);
  } catch (err: any) {
    console.error('[API] POST /api/marcas error:', err);
    if (err?.code === 'P2002') {
      return errorResponse(409, 'Ya existe una marca con ese nombre');
    }
    return errorResponse(500, 'Error al crear marca');
  }
};
