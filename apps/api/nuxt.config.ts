// apps/api/nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-02-18',
  ssr: false,

  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    public: {
      webUrl: process.env.WEB_URL ?? 'http://localhost:5173'
    }
  },

  nitro: {
    experimental: { websocket: true }
  },

  typescript: {
    strict: true
  }
})
