// apps/api/server/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

export function useSupabaseServer() {
  const config = useRuntimeConfig()
  return createClient(
    config.supabaseUrl,
    config.supabaseServiceKey  // service_role: acceso total, solo en servidor
  )
}
