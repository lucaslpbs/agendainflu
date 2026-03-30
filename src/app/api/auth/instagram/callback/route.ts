import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const metaAppId = process.env.META_APP_ID
  const metaAppSecret = process.env.META_APP_SECRET
  const redirectUri = process.env.META_REDIRECT_URI || `${appUrl}/api/auth/instagram/callback`

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') // influencer_id
  const oauthError = url.searchParams.get('error')

  // Validate state is a valid UUID to prevent injection
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (oauthError || !code || !state || !uuidRegex.test(state)) {
    return NextResponse.redirect(`${appUrl}/painel/perfil?instagram=erro`)
  }

  if (!metaAppId || !metaAppSecret) {
    return NextResponse.redirect(`${appUrl}/painel/perfil?instagram=erro`)
  }

  try {
    // 1. Exchange code for short-lived token
    const tokenRes = await fetch(
      'https://graph.facebook.com/v19.0/oauth/access_token?' +
        new URLSearchParams({ client_id: metaAppId, client_secret: metaAppSecret, redirect_uri: redirectUri, code })
    )
    const tokenData = await tokenRes.json()
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Falha ao obter token curto')
    }

    // 2. Exchange for long-lived token (valid 60 days)
    const longTokenRes = await fetch(
      'https://graph.instagram.com/access_token?' +
        new URLSearchParams({
          grant_type: 'ig_exchange_token',
          client_secret: metaAppSecret,
          access_token: tokenData.access_token,
        })
    )
    const longTokenData = await longTokenRes.json()
    if (longTokenData.error || !longTokenData.access_token) {
      throw new Error(longTokenData.error?.message || 'Falha ao obter token longo')
    }
    const longLivedToken: string = longTokenData.access_token

    // 3. Fetch Instagram user info
    const meRes = await fetch(
      'https://graph.instagram.com/me?' +
        new URLSearchParams({ fields: 'id,username,followers_count', access_token: longLivedToken })
    )
    const meData = await meRes.json()
    if (meData.error || !meData.id) {
      throw new Error(meData.error?.message || 'Falha ao obter dados do Instagram')
    }

    // 4. Save to DB
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    const { error: updateError } = await db
      .from('influencers')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({
        instagram_user_id: meData.id,
        instagram_access_token: longLivedToken,
        instagram_token_expires_at: expiresAt,
        instagram_username: meData.username,
        instagram_followers_count: meData.followers_count ?? null,
        instagram_followers_updated_at: new Date().toISOString(),
        instagram_connected: true,
      } as any)
      .eq('id', state)

    if (updateError) throw updateError

    return NextResponse.redirect(`${appUrl}/painel/perfil?instagram=conectado`)
  } catch (err) {
    console.error('[Instagram OAuth Callback]', err)
    return NextResponse.redirect(`${appUrl}/painel/perfil?instagram=erro`)
  }
}
