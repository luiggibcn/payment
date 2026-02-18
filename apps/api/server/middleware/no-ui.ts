// apps/api/server/middleware/no-ui.ts
export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  // Solo permitir rutas /api/* y /_nitro (health interno de Nitro)
  if (!url.pathname.startsWith('/api') && !url.pathname.startsWith('/_')) {
    throw createError({
      statusCode: 404,
      message: 'Not found — this is an API server',
    })
  }
})
