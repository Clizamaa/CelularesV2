import { z } from 'zod';

export const celularSchema = z.object({
  marca:         z.string().min(2, 'La marca debe tener al menos 2 caracteres').max(50),
  modelo:        z.string().min(1, 'El modelo es requerido').max(100),
  serial:        z.string().max(50).optional().nullable().or(z.literal('')),
  imei:          z.string().regex(/^\d{15}$/, 'El IMEI debe tener exactamente 15 dígitos'),
  observaciones: z.string().max(500).optional().default(''),
  estado:        z.enum(['DISPONIBLE', 'ASIGNADO', 'MANTENIMIENTO', 'BAJA']).default('DISPONIBLE'),
});

export const celularUpdateSchema = celularSchema.partial();

export type CelularInput = z.infer<typeof celularSchema>;
