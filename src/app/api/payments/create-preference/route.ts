import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { mpClientForSeller, mpPreference, calcPrecos, isSandbox } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const { booking_id } = await req.json()

    if (!booking_id) {
      return NextResponse.json({ error: 'booking_id obrigatório' }, { status: 400 })
    }

    // Resolve client ids for this user
    const { data: clients } = await db
      .from('clients')
      .select('id')
      .eq('user_id', auth.user_id)

    const clientIds = (clients || []).map((c) => c.id)
    if (clientIds.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const { data: booking } = await db
      .from('bookings')
      .select('*, clients(*), services(*), influencers(*, mp_access_token, mp_connected, mp_user_id)')
      .eq('id', booking_id)
      .in('client_id', clientIds)
      .maybeSingle()

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    if ((booking as any).payment_status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ error: 'Pagamento já iniciado para este agendamento' }, { status: 409 })
    }

    const { data: cp } = await db
      .from('client_profiles' as any)
      .select('nome, email')
      .eq('user_id', auth.user_id)
      .maybeSingle()

    const precoOriginal = Number((booking as any).services?.preco || 0)
    const { precoCliente, taxaMP, comissaoPlataforma } = calcPrecos(precoOriginal)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    const preferenceData = {
      items: [
        {
          id: `booking-${booking.id}`,
          title: `Divulgação: ${(booking as any).services?.tipo} — @${(booking as any).influencers?.username}`,
          quantity: 1,
          unit_price: precoCliente,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: (cp as any)?.email || auth.email || 'cliente@agendainflu.com',
        name: (cp as any)?.nome || 'Cliente',
      },
      marketplace_fee: comissaoPlataforma,
      back_urls: {
        success: `${appUrl}/agendamentos/${booking.id}/pagamento/sucesso`,
        failure: `${appUrl}/agendamentos/${booking.id}/pagamento/erro`,
        pending: `${appUrl}/agendamentos/${booking.id}/pagamento/pendente`,
      },
      auto_return: 'approved' as const,
      notification_url: `${appUrl}/api/payments/webhook`,
      external_reference: `booking-${booking.id}`,
      statement_descriptor: 'AGENDAINFLU',
      expires: true,
      expiration_date_to: expiresAt,
    }

    // Use seller's token if connected (split de pagamentos 1:1)
    // Fall back to platform token for backward compatibility / testing
    const influencer = (booking as any).influencers
    const sellerToken: string | null = influencer?.mp_connected ? influencer.mp_access_token : null
    const preferenceClient = sellerToken ? mpClientForSeller(sellerToken).preference : mpPreference

    const preference = await preferenceClient.create({ body: preferenceData })

    // Persist preference data and calculated prices
    await db
      .from('bookings')
      .update({
        mp_preference_id: preference.id,
        price_original: precoOriginal,
        price_client: precoCliente,
        platform_fee: comissaoPlataforma,
        mp_fee: taxaMP,
        influencer_mp_id: influencer?.mp_user_id || null,
      } as any)
      .eq('id', booking_id)

    return NextResponse.json({
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      is_sandbox: isSandbox,
      price_client: precoCliente,
      price_original: precoOriginal,
    })
  } catch (e) {
    console.error('[POST /api/payments/create-preference]', e)
    return apiError(e)
  }
}
