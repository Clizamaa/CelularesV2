import type { Prisma } from '@prisma/client';

// Tipos inferidos de Prisma con relaciones
export type CelularWithAsignacion = Prisma.CelularGetPayload<{
  include: { asignacion: { include: { simcard: true } } };
}>;

export type SimcardWithAsignacion = Prisma.SimcardGetPayload<{
  include: { asignacion: { include: { celular: true } } };
}>;

export type AsignacionFull = Prisma.AsignacionGetPayload<{
  include: { celular: true; simcard: true };
}>;

// Tipo para funcionarios (API externa)
export interface Funcionario {
  id: string;
  nombre: string;
  cargo: string;
  dependencia: string;
}

// Tipos para respuestas API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}
