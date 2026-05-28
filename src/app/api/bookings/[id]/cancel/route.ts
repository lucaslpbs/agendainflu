import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { addDays, format } from 'date-fns'
import { sendWhatsApp } from '@/lib/wa'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req)

    const { data: clients } = await db
      .from('clients')
      .select('id')
      .eq('user_id', auth.user_id)

    if (!clients || clients.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const clientIds = clients.map((c) => c.id)

    const { data: booking } = await db
      .from('bookings')
      .select('id, status, payment_status, data_agendada, client_id, influencer_id, codigo_confirmacao, mp_payment_id, price_client, influencers(nome, whatsapp)')
      .eq('id', params.id)
      .in('client_id', clientIds)
      .maybeSingle() as any

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    if (['COMPLETED', 'CANCELLED', 'REFUNDED', 'CANCELLATION_REQUESTED'].includes(booking.payment_status)) {
      return NextResponse.json(
        { error: 'Não é possível cancelar um agendamento com status ' + booking.payment_status },
        { status: 400 },
      )
    }

    const minDate = format(addDays(new Date(), 3), 'yyyy-MM-dd')
    if (booking.data_agendada < minDate) {
      return NextResponse.json(
        { error: 'Cancelamento só é permitido com no mínimo 3 dias de antecedência' },
        { status: 400 },
      )
    }

    // Se não foi pago ainda, cancela direto sem precisar de confirmação do influencer
    if (booking.payment_status === 'PENDING_PAYMENT') {
      await db
        .from('bookings')
        .update({ status: 'cancelado', payment_status: 'CANCELLED' } as any)
        .eq('id', params.id)
      return NextResponse.json({ cancelled: true, refund_status: 'not_applicable' })
    }

    // Booking foi pago — entra no fluxo de confirmação pelo influencer antes do reembolso
    await db
      .from('bookings')
      .update({ payment_status: 'CANCELLATION_REQUESTED' } as any)
      .eq('id', params.id)

    // Notifica influencer para confirmar ou rejeitar o cancelamento
    const influencer = booking.influencers as any
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    try {
      if (influencer?.whatsapp) {
        await sendWhatsApp(
          influencer.whatsapp,
          `⚠️ O cliente solicitou cancelamento do agendamento ${booking.codigo_confirmacao}. Acesse o painel para confirmar ou recusar: ${appUrl}/painel/agendamentos`,
        )
      }
    } catch (waErr) {
      console.error('[cancel] influencer WhatsApp notify error:', waErr)
    }

    return NextResponse.json({
      cancelled: false,
      pending_influencer_confirmation: true,
      message: 'Solicitação de cancelamento enviada. O influencer precisa confirmar para o reembolso ser processado.',
    })
  } catch (e) {
    return apiError(e)
  }
}
