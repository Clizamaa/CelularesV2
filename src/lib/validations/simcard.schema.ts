import { z } from 'zod';

export const simcardSchema = z.object({
  numeroSimcard:  z.string().min(3, 'El número de SIM debe tener al menos 3 caracteres').max(30),
  numeroTelefono: z.string().max(15).optional().default(''),
  operador:       z.string().max(50).optional().default(''),
  observaciones:  z.string().max(500).optional().default(''),
  estado:         z.enum(['DISPONIBLE', 'ASIGNADA', 'SUSPENDIDA']).default('DISPONIBLE'),
});

export const simcardUpdateSchema = simcardSchema.partial();

export const asignacionSchema = z.object({
  celularId:         z.string().uuid('ID de celular inválido'),
  simcardId:         z.string().uuid('ID de SIM inválido').optional().nullable(),
  funcionarioId:     z.string().optional().default(''),
  funcionarioNombre: z.string().optional().default(''),
  observaciones:     z.string().max(500).optional().default(''),
});

export type SimcardInput = z.infer<typeof simcardSchema>;
export type AsignacionInput = z.infer<typeof asignacionSchema>;
