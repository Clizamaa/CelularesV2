import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { bamId, simcardId, funcionarioId, funcionarioNombre } = body;

    if (!bamId) return errorResponse(400, 'ID de BAM es requerido');

    // Verify BAM existence and status
    const bam = await prisma.bAM.findUnique({
      where: { id: bamId },
      include: { asignacion: true },
    });

    if (!bam) return errorResponse(404, 'BAM no encontrada');
    if (bam.asignacion?.activa) {
      return errorResponse(409, 'La BAM ya tiene una asignación activa');
    }

    // Create assignment in transaction
    const asignacion = await prisma.$transaction(async (tx) => {
      // Create new assignment for BAM
      const nueva = await tx.asignacionBAM.create({
        data: {
          id: crypto.randomUUID(),
          bamId,
          simcardId: simcardId || null,
          funcionarioId: funcionarioId || null,
          funcionarioNombre: funcionarioNombre || null,
        },
        include: { bam: true, simcard: true },
      });

      // Update BAM status
      await tx.bAM.update({
        where: { id: bamId },
        data: { estado: 'ASIGNADO' },
      });

      // Update SIM status if applicable
      if (simcardId) {
        await tx.simcard.update({
          where: { id: simcardId },
          data: { estado: 'ASIGNADA' },
        });
      }

      return nueva;
    });

    return successResponse(asignacion, undefined, 201);
  } catch (err) {
    console.error('[API] POST /api/asignaciones/bam error:', err);
    return errorResponse(500, 'Error al crear asignación para BAM');
  }
};
