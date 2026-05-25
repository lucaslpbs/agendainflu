import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mpPayment } from '@/lib/mercadopago'
import { sendWhatsApp } from '@/lib/wa'

function validateMpSignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // skip if not configured

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  if (!xSignature) return false

  let ts: string | undefined
  let v1: string | undefined
  for (const part of xSignature.split(',')) {
    const [k, v] = part.split('=')
    if (k?.trim() === 'ts') ts = v?.trim()
    if (k?.trim() === 'v1') v1 = v?.trim()
  }
  if (!ts || !v1) return false

  const parts: string[] = []
  if (dataId) parts.push(`id:${dataId}`)
  if (xRequestId) parts.push(`request-id:${xRequestId}`)
  if (ts) parts.push(`ts:${ts}`)
  const manifest = parts.join(';') + ';'

  const computed = createHmac('sha256', secret).update(manifest).digest('hex')
  return computed === v1
}

async function logTransaction(
  bookingId: string,
  mpPaymentId: string,
  type: string,
  amount: number,
  status: string,
  mpResponse: unknown,
) {
  await db.from('payment_transactions' as any).insert({
    booking_id: bookingId,
    mp_payment_id: mpPaymentId,
    type,
    amount,
    status,
    mp_response: mpResponse,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = data?.id
    if (!paymentId) {
      return NextResponse.json({ received: true })
    }

    if (!validateMpSignature(req, String(paymentId))) {
      console.warn('[webhook] assinatura MP inválida, notificação ignorada')
      return NextResponse.json({ received: true })
    }

    const payment = await mpPayment.get({ id: String(paymentId) })

    const externalRef = (payment as any).external_reference
    if (!externalRef?.startsWith('booking-')) {
      return NextResponse.json({ received: true })
    }

    const bookingId = externalRef.replace('booking-', '')

    const { data: booking } = await db
      .from('bookings')
      .select('id, payment_status, client_id, influencer_id, codigo_confirmacao, mp_payment_id, data_agendada, influencers(*), clients(*), services(*)')
      .eq('id', bookingId)
      .maybeSingle()

    if (!booking) {
      console.warn('[webhook] booking not found:', bookingId)
      return NextResponse.json({ received: true })
    }

    const paymentStatus = (payment as any).status
    const transactionAmount = (payment as any).transaction_amount || 0
    const mpPaymentIdStr = String(paymentId)

    await logTransaction(bookingId, mpPaymentIdStr, 'charge', transactionAmount, paymentStatus, payment)

    if (paymentStatus === 'approved') {
      // Idempotency: skip if already paid
      if ((booking as any).payment_status === 'PAID' || (booking as any).payment_status === 'COMPLETED') {
        return NextResponse.json({ received: true })
      }

      await db
        .from('bookings')
        .update({
          payment_status: 'PAID',
          mp_payment_id: mpPaymentIdStr,
          paid_at: new Date().toISOString(),
          // Upgrade booking status to 'confirmado' automatically
          status: 'confirmado',
        } as any)
        .eq('id', bookingId)

      // Notify influencer about new paid booking
      try {
        const infWhatsapp = (booking as any).influencers?.whatsapp
        const clientNome = (booking as any).clients?.nome || 'Cliente'
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
        if (infWhatsapp) {
          await sendWhatsApp(
            infWhatsapp,
            `Pagamento confirmado! ${clientNome} pagou pelo agendamento ${(booking as any).codigo_confirmacao}. Acesse o painel: ${appUrl}/painel/agendamentos`,
          )
        }
      } catch (waErr) {
        console.error('[webhook] WhatsApp notify error:', waErr)
      }

      // Dispatch n8n webhook only after payment is confirmed
      try {
        const webhookUrl = process.env.N8N_WEBHOOK_NOVO_AGENDAMENTO
        const infWhatsapp = (booking as any).influencers?.whatsapp
        if (webhookUrl && infWhatsapp) {
          const dataFormatada = new Date((booking as any).data_agendada + 'T12:00:00').toLocaleDateString('pt-BR')
          const servicoPreco = (booking as any).services?.preco ?? transactionAmount
          const valorFormatado = 'R$ ' + Number(servicoPreco).toFixed(2)
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              evento: 'novo_agendamento',
              influencer_nome: (booking as any).influencers?.nome,
              influencer_whatsapp: infWhatsapp,
              cliente_nome: (booking as any).clients?.nome || 'Cliente',
              cliente_empresa: (booking as any).clients?.empresa || '',
              servico_tipo: (booking as any).services?.tipo,
              data_agendada: dataFormatada,
              valor: valorFormatado,
              codigo: (booking as any).codigo_confirmacao,
            }),
          })
        }
      } catch (n8nErr) {
        console.error('[webhook] n8n novo_agendamento error:', n8nErr)
      }
    }

    if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
      if ((booking as any).payment_status === 'PENDING_PAYMENT') {
        await db
          .from('bookings')
          .update({ payment_status: 'PENDING_PAYMENT' } as any)
          .eq('id', bookingId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('[POST /api/payments/webhook]', e)
    // Always return 200 to MP so it doesn't retry indefinitely
    return NextResponse.json({ received: true })
  }
}
