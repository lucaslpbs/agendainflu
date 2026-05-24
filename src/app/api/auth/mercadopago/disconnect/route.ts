import { NextRequest, NextResponse } from 'next/server'
import { requireInfluencer } from '@/lib/auth'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)

    await db
      .from('influencers')
      .update({
        mp_access_token: null,
        mp_refresh_token: null,
        mp_user_id: null,
        mp_token_expires_at: null,
        mp_connected_at: null,
        mp_connected: false,
      } as any)
      .eq('id', auth.influencer_id)

    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
