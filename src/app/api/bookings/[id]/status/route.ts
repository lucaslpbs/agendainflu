import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { sendWhatsApp } from '@/lib/wa'
import { mpRefund } from '@/lib/mercadopago'

const VALID_TRANSITIONS: Record<string, string[]> = {
  pendente: ['confirmado', 'cancelado'],
  confirmado: ['concluido', 'cancelado'],
  concluido: [],
  cancelado: [],
}

// payment_statuses que indicam que o cliente já pagou e precisa de reembolso se o influencer cancelar
const PAID_STATUSES = new Set(['PAID', 'IN_PROGRESS', 'CANCELLATION_REQUESTED'])

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) {
      return NextResponse.json({ error: 'Perfil de influencer nao encontrado' }, { status: 400 })
    }

    const { status: newStatus } = await req.json()
    if (!newStatus) {
      return NextResponse.json({ error: 'status obrigatorio' }, { status: 400 })
    }

    const { data: booking } = await db
      .from('bookings')
      .select('id, status, payment_status, influencer_id, client_id, codigo_confirmacao, data_agendada, mp_payment_id, price_client, clients(nome, whatsapp)')
      .eq('id', params.id)
      .eq('influencer_id', auth.influencer_id)
      .maybeSingle() as any

    if (!booking) return NextResponse.json({ error: 'NOT_FOUND: Agendamento nao encontrado' }, { status: 404 })

    const allowed = VALID_TRANSITIONS[booking.status] || []
    if (!allowed.includes(newStatus)) {
      return NextResponse.json({ error: 'Transicao de status invalida: ' + booking.status + ' -> ' + newStatus }, { status: 400 })
    }

    const isCancelling = newStatus === 'cancelado'
    const clientAlreadyPaid = PAID_STATUSES.has(booking.payment_status)

    // Se influencer está cancelando um booking pago, emite reembolso antes de atualizar o status
    let refundStatus = 'not_applicable'
    if (isCancelling && clientAlreadyPaid && booking.mp_payment_id) {
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
        console.error('[status] MP refund error on influencer cancel:', refundErr)
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

    const newPaymentStatus = isCancelling && clientAlreadyPaid ? 'REFUNDED' : undefined

    const updatePayload: Record<string, unknown> = { status: newStatus }
    if (newPaymentStatus) updatePayload.payment_status = newPaymentStatus

    const { data: updated, error } = await db
      .from('bookings')
      .update(updatePayload as any)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    const client = booking.clients as any
    const { data: inf } = await db
      .from('influencers')
      .select('nome, username')
      .eq('id', booking.influencer_id)
      .maybeSingle()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const dataFormatada = new Date(booking.data_agendada + 'T12:00:00').toLocaleDateString('pt-BR')
    let mensagem_enviada = false

    if (client?.whatsapp) {
      let msg = ''
      if (newStatus === 'confirmado') {
        msg = 'Confirmado, ' + client.nome + '! Divulgacao agendada para ' + dataFormatada + '. Codigo: ' + booking.codigo_confirmacao
      } else if (newStatus === 'cancelado') {
        const reembolsoInfo = clientAlreadyPaid
          ? ` O reembolso de R$ ${Number(booking.price_client || 0).toFixed(2)} foi processado e será creditado em breve.`
          : ''
        msg = 'Seu agendamento ' + booking.codigo_confirmacao + ' foi cancelado pelo influencer.' + reembolsoInfo + ' Para reagendar: ' + appUrl + '/' + inf?.username
      } else if (newStatus === 'concluido') {
        msg = 'Ola ' + client.nome + '! Como foi a divulgacao com ' + inf?.nome + '? Agradecemos a parceria!'
      }
      if (msg) {
        try {
          mensagem_enviada = await sendWhatsApp(client.whatsapp, msg)
        } catch (waErr) {
          console.error('WhatsApp notification failed (booking status):', waErr)
        }
      }
    }

    return NextResponse.json({ booking: updated, mensagem_enviada, refund_status: refundStatus })
  } catch (e) {
    console.error('[PATCH /api/bookings/[id]/status] Error:', e)
    return apiError(e)
  }
}
