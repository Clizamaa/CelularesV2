import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';

export const GET: APIRoute = async ({ url }) => {
  const serial = url.searchParams.get('serial');
  const imei = url.searchParams.get('imei');

  if (!serial && !imei) {
    return new Response(JSON.stringify({ exists: false }), { status: 200 });
  }

  try {
    const existing = await prisma.celular.findFirst({
      where: {
        OR: [
          ...(serial ? [{ serial }] : []),
          ...(imei ? [{ imei }] : []),
        ],
      },
      select: { id: true, serial: true, imei: true, marca: true, modelo: true }
    });

    return new Response(JSON.stringify({ 
      exists: !!existing, 
      details: existing 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ exists: false, error }), { status: 500 });
  }
};
