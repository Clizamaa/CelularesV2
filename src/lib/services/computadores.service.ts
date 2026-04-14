import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function getComputadores(where: Prisma.ComputadorWhereInput = {}) {
  return prisma.computador.findMany({
    where,
    include: { asignacion: { where: { activa: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getComputadorById(id: string) {
  return prisma.computador.findUnique({
    where: { id },
    include: { asignacion: { where: { activa: true } } },
  });
}

export async function createComputador(data: Prisma.ComputadorCreateInput) {
  return prisma.computador.create({ data });
}

export async function updateComputador(id: string, data: Prisma.ComputadorUpdateInput) {
  return prisma.computador.update({
    where: { id },
    data,
  });
}

export async function deleteComputador(id: string) {
  // First delete assignments if they exist (Prisma will handle if mapped correctly, 
  // but if not cascade, we do it manually)
  await prisma.asignacionAIO.deleteMany({
    where: { computadorId: id }
  });
  
  return prisma.computador.delete({
    where: { id },
  });
}
