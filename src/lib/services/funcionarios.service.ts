import type { Funcionario } from '@/types/index';

// Datos mock de funcionarios para desarrollo
const mockFuncionarios: Funcionario[] = [
  { id: 'F001', nombre: 'María González Pérez', cargo: 'Analista de Sistemas', dependencia: 'Departamento de TI' },
  { id: 'F002', nombre: 'Carlos Rodríguez Muñoz', cargo: 'Jefe de Operaciones', dependencia: 'Gerencia de Operaciones' },
  { id: 'F003', nombre: 'Andrea Silva Contreras', cargo: 'Coordinadora de Proyectos', dependencia: 'Departamento de Proyectos' },
  { id: 'F004', nombre: 'Roberto Fernández López', cargo: 'Director Administrativo', dependencia: 'Dirección Administrativa' },
  { id: 'F005', nombre: 'Patricia Morales Soto', cargo: 'Encargada de Logística', dependencia: 'Departamento de Logística' },
  { id: 'F006', nombre: 'Jorge Martínez Vargas', cargo: 'Ingeniero de Redes', dependencia: 'Departamento de TI' },
  { id: 'F007', nombre: 'Carmen Torres Díaz', cargo: 'Analista Financiero', dependencia: 'Departamento de Finanzas' },
  { id: 'F008', nombre: 'Diego Herrera Campos', cargo: 'Supervisor de Terreno', dependencia: 'Gerencia de Operaciones' },
  { id: 'F009', nombre: 'Valentina Ruiz Castro', cargo: 'Asistente Ejecutiva', dependencia: 'Dirección General' },
  { id: 'F010', nombre: 'Fernando Reyes Guzmán', cargo: 'Jefe de Mantenimiento', dependencia: 'Departamento de Infraestructura' },
  { id: 'F011', nombre: 'Claudia Navarro Pinto', cargo: 'Especialista en RRHH', dependencia: 'Departamento de Personas' },
  { id: 'F012', nombre: 'Alejandro Vega Fuentes', cargo: 'Técnico Informático', dependencia: 'Departamento de TI' },
];

// Caché en memoria con TTL de 5 minutos
const cache = new Map<string, { data: Funcionario[]; ts: number }>();
const TTL = 5 * 60 * 1000;

export async function buscarFuncionarios(q: string): Promise<Funcionario[]> {
  const key = q.toLowerCase().trim();

  if (!key) return [];

  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL) return cached.data;

  // Intentar API externa primero, si falla usar mock
  try {
    const apiUrl = import.meta.env.FUNCIONARIOS_API_URL;
    const apiKey = import.meta.env.FUNCIONARIOS_API_KEY;

    if (apiUrl && apiUrl !== 'https://api.tuorganizacion.cl') {
      const res = await fetch(
        `${apiUrl}/search?q=${encodeURIComponent(q)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data: Funcionario[] = await res.json();
      cache.set(key, { data, ts: Date.now() });
      return data;
    }
  } catch (err) {
    console.error('[FuncionariosService] API externa no disponible, usando datos mock:', err);
  }

  // Fallback: buscar en datos mock
  const results = mockFuncionarios.filter(
    (f) =>
      f.nombre.toLowerCase().includes(key) ||
      f.cargo.toLowerCase().includes(key) ||
      f.dependencia.toLowerCase().includes(key)
  );

  cache.set(key, { data: results, ts: Date.now() });
  return results;
}
