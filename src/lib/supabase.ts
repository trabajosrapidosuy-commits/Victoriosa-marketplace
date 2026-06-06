import { createClient } from '@supabase/supabase-js'
import { getSupabasePublicEnv } from '@/lib/supabase/env'

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabasePublicEnv()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client (includes service role for admin operations)
export const getServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('Missing Supabase service role key for server operations')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
