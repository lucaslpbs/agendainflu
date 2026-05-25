import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const appId = process.env.MP_APPLICATION_ID
  const appSecret = process.env.MP_APPLICATION_SECRET

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') // influencer UUID
  const oauthError = url.searchParams.get('error')

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (oauthError || !code || !state || !uuidRegex.test(state)) {
    console.error('[MP OAuth] invalid params', { oauthError, code: !!code, state, stateValid: state ? uuidRegex.test(state) : false })
    return NextResponse.redirect(`${appUrl}/painel/perfil?mp=erro&reason=invalid_params`)
  }

  if (!appId || !appSecret) {
    console.error('[MP OAuth] missing env vars', { hasAppId: !!appId, hasAppSecret: !!appSecret })
    return NextResponse.redirect(`${appUrl}/painel/perfil?mp=erro&reason=missing_env`)
  }

  try {
    const redirectUri = `${appUrl}/api/auth/mercadopago/callback`

    // Exchange code for access token
    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: appId,
        client_secret: appSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[MP OAuth] token exchange failed', tokenData)
      const mpErrCode = tokenData?.error || tokenData?.message || 'token_failed'
      return NextResponse.redirect(`${appUrl}/painel/perfil?mp=erro&reason=token_exchange&detail=${encodeURIComponent(mpErrCode)}`)
    }

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

    const { error: updateError } = await db
      .from('influencers')
      .update({
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token || null,
        mp_user_id: String(tokenData.user_id),
        mp_token_expires_at: expiresAt,
        mp_connected_at: new Date().toISOString(),
        mp_connected: true,
      } as any)
      .eq('id', state)

    if (updateError) throw updateError

    return NextResponse.redirect(`${appUrl}/painel/perfil?mp=conectado`)
  } catch (err) {
    console.error('[MP OAuth Callback]', err)
    return NextResponse.redirect(`${appUrl}/painel/perfil?mp=erro`)
  }
}
