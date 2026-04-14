export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, max = 30): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + '…';
}

export function estadoLabel(estado: string): string {
  const labels: Record<string, string> = {
    DISPONIBLE: 'Disponible',
    ASIGNADO: 'Asignado',
    ASIGNADA: 'Asignada',
    MANTENIMIENTO: 'Mantenimiento',
    BAJA: 'Baja',
    SUSPENDIDA: 'Suspendida',
  };
  return labels[estado] ?? estado;
}
