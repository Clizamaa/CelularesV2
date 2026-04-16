import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) return errorResponse(400, 'ID requerido');

    const asignacion = await prisma.asignacionBAM.findUnique({
      where: { id },
      include: { bam: true, simcard: true },
    });

    if (!asignacion) return errorResponse(404, 'Asignación no encontrada');

    await prisma.$transaction(async (tx) => {
      // Release BAM
      await tx.bAM.update({
        where: { id: asignacion.bamId },
        data: { estado: 'DISPONIBLE' },
      });

      // Release SIM if any
      if (asignacion.simcardId) {
        await tx.simcard.update({
          where: { id: asignacion.simcardId },
          data: { estado: 'DISPONIBLE' },
        });
      }

      // Delete the assignment record (or deactivate it)
      // The user's Celular assignment deactivates it. I'll delete it or deactivate it?
      // In Celular it says: data: { activa: false, fechaDevolucion: new Date() }
      // But AsignacionBAM in my schema doesn't have fechaDevolucion?
      // Let's check schema again.
      
      // Deactivate assignment
      await tx.asignacionBAM.update({
        where: { id },
        data: { activa: false, fechaDevolucion: new Date() }
      });
    });

    return successResponse({ released: true });
  } catch (err) {
    console.error('[API] DELETE /api/asignaciones/bam/[id] error:', err);
    return errorResponse(500, 'Error al liberar asignación de BAM');
  }
};
