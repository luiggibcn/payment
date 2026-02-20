export default defineNuxtConfig({
  compatibilityDate: '2026-02-18',
  ssr: false,
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': process.env.WEB_URL ?? 'http://localhost:5173',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        // 'Access-Control-Allow-Headers': 'X-PAYMENT, X-DATA',  // // Headers custom del BE, no se activaran hasta que negocio decida que es necesario
        'Access-Control-Allow-Credentials': 'true'
      }
    }
  },
  nitro: { experimental: { websocket: true } },
  typescript: { strict: true }
})
