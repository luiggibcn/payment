export default defineEventHandler((event) => {
  const allowedOrigins = [
    'http://localhost:1313',
    import.meta.env.VITE_API_URL ?? 'http://localhost:3001'  // ← pon tu URL de web en Vercel
  ]

  const origin = getRequestHeader(event, 'origin') ?? ''

  if (allowedOrigins.includes(origin)) {
    setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
  }

  setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
  setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')

  // Preflight
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
