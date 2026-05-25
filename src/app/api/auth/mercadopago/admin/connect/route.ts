import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const appId = process.env.MP_APPLICATION_ID

  try {
    await requireAdmin(req)
  } catch {
    return NextResponse.redirect(`${appUrl}/login`)
  }

  if (!appId) {
    return NextResponse.json({ error: 'MP_APPLICATION_ID não configurado' }, { status: 500 })
  }

  const redirectUri = `${appUrl}/api/auth/mercadopago/callback`

  const oauthUrl = new URL('https://auth.mercadopago.com.br/authorization')
  oauthUrl.searchParams.set('client_id', appId)
  oauthUrl.searchParams.set('response_type', 'code')
  oauthUrl.searchParams.set('platform_id', 'mp')
  oauthUrl.searchParams.set('redirect_uri', redirectUri)
  oauthUrl.searchParams.set('state', 'admin')

  return NextResponse.redirect(oauthUrl.toString())
}
