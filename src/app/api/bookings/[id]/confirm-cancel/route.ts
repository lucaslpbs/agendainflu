import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { mpRefund } from '@/lib/mercadopago'
import { sendWhatsApp } from '@/lib/wa'

// Influencer confirma ou rejeita um cancelamento solicitado pelo cliente (CANCELLATION_REQUESTED)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) {
      return NextResponse.json({ error: 'Perfil de influencer não encontrado' }, { status: 400 })
    }

    const { confirm } = await req.json() as { confirm: boolean }
    if (typeof confirm !== 'boolean') {
      return NextResponse.json({ error: 'Campo "confirm" (boolean) é obrigatório' }, { status: 400 })
    }

    const { data: booking } = await db
      .from('bookings')
      .select('id, status, payment_status, influencer_id, client_id, codigo_confirmacao, mp_payment_id, price_client, clients(nome, whatsapp)')
      .eq('id', params.id)
      .eq('influencer_id', auth.influencer_id)
      .maybeSingle() as any

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    if (booking.payment_status !== 'CANCELLATION_REQUESTED') {
      return NextResponse.json(
        { error: 'Este agendamento não possui solicitação de cancelamento pendente' },
        { status: 400 },
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const client = booking.clients as any

    // Influencer rejeitou — volta para PAID, notifica cliente
    if (!confirm) {
      await db
        .from('bookings')
        .update({ payment_status: 'PAID' } as any)
        .eq('id', params.id)

      try {
        if (client?.whatsapp) {
          await sendWhatsApp(
            client.whatsapp,
            `O influencer não confirmou o cancelamento do agendamento ${booking.codigo_confirmacao}. O agendamento permanece ativo.`,
          )
        }
      } catch (waErr) {
        console.error('[confirm-cancel] client WhatsApp notify error:', waErr)
      }

      return NextResponse.json({ confirmed: false, message: 'Solicitação de cancelamento recusada. Agendamento mantido.' })
    }

    // Influencer confirmou — emite reembolso e cancela
    let refundStatus = 'not_applicable'

    if (booking.mp_payment_id) {
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
        console.error('[confirm-cancel] MP refund error:', refundErr)
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
      .update({ status: 'cancelado', payment_status: 'REFUNDED' } as any)
      .eq('id', params.id)

    try {
      if (client?.whatsapp) {
        await sendWhatsApp(
          client.whatsapp,
          `Cancelamento do agendamento ${booking.codigo_confirmacao} confirmado. O reembolso de R$ ${Number(booking.price_client || 0).toFixed(2)} foi processado e será creditado em breve.`,
        )
      }
    } catch (waErr) {
      console.error('[confirm-cancel] client WhatsApp notify error:', waErr)
    }

    return NextResponse.json({ confirmed: true, refund_status: refundStatus })
  } catch (e) {
    console.error('[POST /api/bookings/[id]/confirm-cancel]', e)
    return apiError(e)
  }
}
