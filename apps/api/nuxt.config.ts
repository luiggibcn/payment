// apps/api/nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-02-18',
  ssr: false,

  // ← elimina el bloque future por completo

  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    public: {}
  },
  nitro: {
    experimental: { websocket: true }
  },
  typescript: {
    strict: true
  }
})
