import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * POST /api/computadores
 * Creates a new AIO entry
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const serial = data.serial?.trim();
    
    if (!serial) {
      return errorResponse(400, 'El número de serie es obligatorio');
    }

    // Check if serial already exists
    const existing = await prisma.computador.findUnique({
      where: { serial }
    });

    if (existing) {
      return errorResponse(400, `El equipo con serial ${data.serial} ya existe en el sistema`);
    }

    const computador = await prisma.computador.create({
      data: {
        marca: data.marca || 'Lenovo',
        modelo: data.modelo || 'AIO 3',
        serial: serial,
        especificaciones: data.especificaciones || '',
        observaciones: data.observaciones || '',
        estado: data.estado || 'DISPONIBLE'
      }
    });

    return successResponse(computador);
  } catch (err: any) {
    console.error('[API] POST /api/computadores error:', err);
    return errorResponse(500, 'Error interno del servidor al registrar equipo', {
      code: err?.code,
      message: err?.message
    });
  }
};

/**
 * GET /api/computadores
 * Lists computers
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const q = url.searchParams.get('q') || '';
    const estado = url.searchParams.get('estado') || '';
    
    const computadores = await prisma.computador.findMany({
      where: {
        ...(estado && { estado: estado as any }),
        ...(q && {
          OR: [
            { serial: { contains: q } },
            { marca: { contains: q } },
            { modelo: { contains: q } }
          ]
        })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return successResponse(computadores);
  } catch (err) {
    return errorResponse(500, 'Error al obtener equipos');
  }
};
