import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  // Validación básica
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required',
    })
  }

  const config = useRuntimeConfig()
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)

  // 1. Sign in con Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.session || !authData.user) {
    throw createError({
      statusCode: 401,
      message: authError?.message ?? 'Invalid credentials',
    })
  }

  // 2. Obtener rol del usuario en su tenant
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role, tenant_id')
    .eq('user_id', authData.user.id)
    .single()

  if (roleError || !roleData) {
    throw createError({
      statusCode: 403,
      message: 'User has no role assigned',
    })
  }

  // 3. Devolver sesión + user + rol
  return {
    session: {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at,
    },
    user: {
      id: authData.user.id,
      email: authData.user.email,
      full_name: authData.user.user_metadata?.full_name ?? null,
      role: roleData.role,
      tenant_id: roleData.tenant_id,
    },
  }
})
