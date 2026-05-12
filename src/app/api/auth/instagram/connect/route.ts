import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { key: 'auth-instagram', limit: 10, windowMs: 60_000 })
  if (rl) return rl
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const metaAppId = process.env.META_APP_ID
  const redirectUri = process.env.META_REDIRECT_URI || `${appUrl}/api/auth/instagram/callback`

  if (!metaAppId) {
    return NextResponse.json({ error: 'META_APP_ID não configurado' }, { status: 500 })
  }

  // Get influencer_id: from query param (post-registration flow) or from JWT auth
  const url = new URL(req.url)
  let influencerId = url.searchParams.get('influencer_id')

  if (!influencerId) {
    const auth = await getAuthUser(req)
    if (!auth) {
      return NextResponse.redirect(`${appUrl}/login`)
    }
    const { data: inf } = await db
      .from('influencers')
      .select('id')
      .eq('user_id', auth.user_id)
      .maybeSingle()
    if (!inf) {
      return NextResponse.json({ error: 'NOT_FOUND: Influencer não encontrado' }, { status: 404 })
    }
    influencerId = inf.id
  }

  const oauthUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  oauthUrl.searchParams.set('client_id', metaAppId)
  oauthUrl.searchParams.set('redirect_uri', redirectUri)
  oauthUrl.searchParams.set('scope', 'instagram_business_basic,instagram_business_manage_insights,pages_show_list')
  oauthUrl.searchParams.set('response_type', 'code')
  oauthUrl.searchParams.set('state', influencerId)

  return NextResponse.redirect(oauthUrl.toString())
}
