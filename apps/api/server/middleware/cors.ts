export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const allowedOrigins = [
    'http://localhost:1313',
    config.public.webUrl
  ].filter(Boolean)

  const origin = getRequestHeader(event, 'origin') ?? ''

  if (allowedOrigins.includes(origin)) {
    setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
  }

  setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
  setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')

  // ✅ event.method en vez de getMethod(event)
  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
