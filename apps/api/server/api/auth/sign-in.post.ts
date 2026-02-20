import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password required' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Sign in
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw createError({ statusCode: 401, message: error.message })
  }

  // 2. Obtener rol y tenant del usuario
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role, tenant_id')
    .eq('user_id', data.user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name ?? null,
      role: roleData?.role ?? 'user',
      tenant_id: roleData?.tenant_id ?? null,
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    }
  }
})
