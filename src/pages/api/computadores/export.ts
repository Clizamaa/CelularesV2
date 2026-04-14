import type { APIRoute } from 'astro';
import { getComputadores } from '@/lib/services/computadores.service';
import * as XLSX from 'xlsx';

export const GET: APIRoute = async () => {
  try {
    const computadores = await getComputadores();

    // Transform data for Excel (Marca, Modelo, Serial only)
    const data = computadores.map(c => ({
      'Marca': c.marca,
      'Modelo': c.modelo,
      'Serial': c.serial
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Computadores');

    // Generate buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Reporte_Computadores_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });
  } catch (err) {
    console.error('[API] GET /api/computadores/export error:', err);
    return new Response('Error al generar el reporte', { status: 500 });
  }
};
