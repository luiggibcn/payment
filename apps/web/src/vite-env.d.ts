/// <reference types="vite/client" />

interface ImportMetaEnv {
  // see https://vitejs.dev/guide/env-and-mode.html#env-files
  // add .env variables.
  readonly VITE_APP_TITLE: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_URL: string
}

// biome-ignore lint/correctness/noUnusedVariables: Not used in this file
interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __WEB_VERSION__: string
declare const __API_VERSION__: string