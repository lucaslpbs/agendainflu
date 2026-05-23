import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mpPayment } from '@/lib/mercadopago'
import { sendWhatsApp } from '@/lib/wa'

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

    const payment = await mpPayment.get({ id: String(paymentId) })

    const externalRef = (payment as any).external_reference
    if (!externalRef?.startsWith('booking-')) {
      return NextResponse.json({ received: true })
    }

    const bookingId = externalRef.replace('booking-', '')

    const { data: booking } = await db
      .from('bookings')
      .select('id, payment_status, client_id, influencer_id, codigo_confirmacao, mp_payment_id, influencers(*), clients(*)')
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
