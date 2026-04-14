interface SuccessMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export function successResponse(data: unknown, meta?: SuccessMeta, status = 200): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...(meta && { meta }),
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export function errorResponse(status: number, message: string, details?: unknown): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
