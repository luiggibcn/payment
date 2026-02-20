import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { email, password, fullName } = await readBody(event)

  if (!email || !password || password.length < 6) {
    throw createError({ 
      statusCode: 400, 
      message: 'Email and password (6+ chars) required' 
    })
  }

  // ⭐ Client directo con service_role
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName ?? null } }
  })

  if (error) {
    throw createError({ 
      statusCode: 400, 
      message: error.message 
    })
  }

  return {
    success: true,
    message: 'User created. Check email.',
    user: data.user
  }
})
