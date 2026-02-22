const getWebUrl = (): string => {
  return process.env.APP_NODE_ENV !== 'local' ? process.env.WEB_URL! : 'http://localhost:5173'
}
export default defineNuxtConfig({
  compatibilityDate: '2026-02-18',
  ssr: false,
  runtimeConfig: {
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  public: {
    webUrl: getWebUrl(),
  }
}
,
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': getWebUrl(),
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
