import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const appId = process.env.MP_APPLICATION_ID

  if (!appId) {
    return NextResponse.json({ error: 'MP_APPLICATION_ID não configurado' }, { status: 500 })
  }

  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.redirect(`${appUrl}/login`)

  const { data: inf } = await db
    .from('influencers')
    .select('id')
    .eq('user_id', auth.user_id)
    .maybeSingle()

  if (!inf) {
    return NextResponse.json({ error: 'Influencer não encontrado' }, { status: 404 })
  }

  const redirectUri = `${appUrl}/api/auth/mercadopago/callback`

  const oauthUrl = new URL('https://auth.mercadopago.com/authorization')
  oauthUrl.searchParams.set('client_id', appId)
  oauthUrl.searchParams.set('response_type', 'code')
  oauthUrl.searchParams.set('platform_id', 'mp')
  oauthUrl.searchParams.set('redirect_uri', redirectUri)
  oauthUrl.searchParams.set('state', inf.id) // influencer UUID as state

  return NextResponse.redirect(oauthUrl.toString())
}
