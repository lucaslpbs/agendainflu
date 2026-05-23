import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { addDays, format } from 'date-fns'
import { mpRefund } from '@/lib/mercadopago'

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
      .select('id, status, payment_status, data_agendada, client_id, influencer_id, codigo_confirmacao, mp_payment_id, price_client')
      .eq('id', params.id)
      .in('client_id', clientIds)
      .maybeSingle() as any

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    if (['COMPLETED', 'CANCELLED'].includes(booking.payment_status)) {
      return NextResponse.json(
        { error: 'Não é possível cancelar um agendamento ' + booking.status },
        { status: 400 },
      )
    }

    const minDate = format(addDays(new Date(), 2), 'yyyy-MM-dd')
    if (booking.data_agendada < minDate) {
      return NextResponse.json(
        { error: 'Cancelamento só é permitido com no mínimo 2 dias de antecedência' },
        { status: 400 },
      )
    }

    let refundStatus = 'not_applicable'

    // Issue refund if payment was already captured
    if (booking.payment_status === 'PAID' && booking.mp_payment_id) {
      try {
        const refund = await mpRefund.create({
          payment_id: booking.mp_payment_id,
          body: { amount: booking.price_client },
        })

        refundStatus = (refund as any).status || 'approved'

        await db.from('payment_transactions' as any).insert({
          booking_id: params.id,
          mp_payment_id: booking.mp_payment_id,
          type: 'refund',
          amount: booking.price_client || 0,
          status: refundStatus,
          mp_response: refund,
        })
      } catch (refundErr) {
        console.error('[cancel] MP refund error:', refundErr)
        refundStatus = 'error'
        await db.from('payment_transactions' as any).insert({
          booking_id: params.id,
          mp_payment_id: booking.mp_payment_id,
          type: 'refund',
          amount: booking.price_client || 0,
          status: 'error',
          mp_response: { error: String(refundErr) },
        })
      }
    }

    await db
      .from('bookings')
      .update({ status: 'cancelado', payment_status: 'CANCELLED' } as any)
      .eq('id', params.id)

    // Notify influencer
    try {
      const { data: inf } = await db
        .from('influencers')
        .select('nome, whatsapp')
        .eq('id', booking.influencer_id)
        .maybeSingle()

      const { data: client } = await db
        .from('clients')
        .select('nome')
        .eq('id', booking.client_id)
        .maybeSingle()

      const webhookUrl = process.env.N8N_WEBHOOK_NOVO_AGENDAMENTO
      if (webhookUrl && inf?.whatsapp) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evento: 'agendamento_cancelado_cliente',
            influencer_nome: inf.nome,
            influencer_whatsapp: inf.whatsapp,
            cliente_nome: client?.nome || 'Cliente',
            codigo: booking.codigo_confirmacao,
            data_agendada: new Date(booking.data_agendada + 'T12:00:00').toLocaleDateString('pt-BR'),
          }),
        })
      }
    } catch (notifyErr) {
      console.error('[cancel] notify error:', notifyErr)
    }

    return NextResponse.json({ cancelled: true, refund_status: refundStatus })
  } catch (e) {
    return apiError(e)
  }
}
