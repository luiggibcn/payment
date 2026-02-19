export default defineNuxtConfig({
  compatibilityDate: '2026-02-18',
  ssr: false,

  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    supabaseServiceKey: process.env.SUPABASE_ANON_KEY ?? '',
    public: {
      webUrl: process.env.WEB_URL ?? 'http://localhost:5173'
    }
  },
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': process.env.WEB_URL,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-PAYMENT, X-DATA',
        'Access-Control-Allow-Credentials': 'true'
      }
    }
  },
  nitro: {
    experimental: { websocket: true }
  },
  typescript: {
    strict: true
  }
})
