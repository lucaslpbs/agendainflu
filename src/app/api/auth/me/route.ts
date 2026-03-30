import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { key: 'auth-me', limit: 10, windowMs: 60_000 })
  if (rl) return rl

  try {
    const auth = await requireAuth(req)

    let profile = null
    if (auth.role === 'influencer' && auth.influencer_id) {
      const { data } = await db
        .from('influencers')
        .select('*')
        .eq('id', auth.influencer_id)
        .maybeSingle()
      profile = data
    } else if (auth.role === 'client') {
      const { data } = await db
        .from('client_profiles' as any)
        .select('*')
        .eq('user_id', auth.user_id)
        .maybeSingle()
      profile = data
    }

    return NextResponse.json({
      user: {
        id: auth.user_id,
        email: auth.email,
        role: auth.role,
        influencer_id: auth.influencer_id,
      },
      profile,
    })
  } catch (e) {
    return apiError(e)
  }
}
