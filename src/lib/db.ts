import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceKey && process.env.NODE_ENV !== 'test') {
  console.warn('[db] SUPABASE_SERVICE_ROLE_KEY não configurada — operações privilegiadas falharão')
}

// Usa service_role key para bypassar RLS nas API Routes
export const db = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
