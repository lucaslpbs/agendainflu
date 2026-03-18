import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'

export async function GET(req: NextRequest) {
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
