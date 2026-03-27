import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)

    const { data: inf } = await db
      .from('influencers')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select('id, instagram_access_token, instagram_connected' as any)
      .eq('user_id', auth.user_id)
      .maybeSingle()

    const record = inf as any
    if (!record?.instagram_connected || !record?.instagram_access_token) {
      return NextResponse.json({ error: 'Instagram não conectado' }, { status: 400 })
    }

    const refreshRes = await fetch(
      'https://graph.instagram.com/refresh_access_token?' +
        new URLSearchParams({
          grant_type: 'ig_refresh_token',
          access_token: record.instagram_access_token,
        })
    )
    const refreshData = await refreshRes.json()

    if (refreshData.error || !refreshData.access_token) {
      throw new Error(refreshData.error?.message || 'Falha ao renovar token')
    }

    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    await db
      .from('influencers')
      .update({ instagram_access_token: refreshData.access_token, instagram_token_expires_at: expiresAt } as any)
      .eq('id', record.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    return apiError(err)
  }
}
