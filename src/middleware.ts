import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const start = Date.now();
  const { request } = context;

  try {
    const response = await next();
    const duration = Date.now() - start;

    // Log API requests
    if (request.url.includes('/api/')) {
      console.log(
        `[${new Date().toISOString()}] ${request.method} ${new URL(request.url).pathname} → ${response.status} (${duration}ms)`
      );
    }

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(
      `[${new Date().toISOString()}] ${request.method} ${new URL(request.url).pathname} → ERROR (${duration}ms):`,
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Error interno del servidor' },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
