import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { sendWhatsApp } from '@/lib/wa'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)

    const { data: booking } = await (db
      .from('bookings')
      .select('id, payment_status, status, price_original, codigo_confirmacao, mp_payment_id, influencers(nome, username, whatsapp), clients(nome)')
      .eq('id', params.id)
      .maybeSingle() as any)

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    if (booking.payment_status !== 'AWAITING_TRANSFER') {
      return NextResponse.json(
        { error: 'Este agendamento não está aguardando transferência' },
        { status: 400 }
      )
    }

    // Marcar como pago
    await db
      .from('bookings')
      .update({
        payment_status: 'COMPLETED',
        released_at: new Date().toISOString(),
      } as any)
      .eq('id', params.id)

    // Audit log
    await db.from('payment_transactions' as any).insert({
      booking_id: params.id,
      mp_payment_id: booking.mp_payment_id || null,
      type: 'manual_transfer',
      amount: booking.price_original || 0,
      status: 'transferred',
      mp_response: { note: 'manual_transfer_by_admin', booking_id: params.id },
    })

    // Notificar influenciadora que recebeu o pagamento
    try {
      const infWa = (booking as any).influencers?.whatsapp
      const infNome = (booking as any).influencers?.nome || 'Influenciadora'
      if (infWa) {
        await sendWhatsApp(
          infWa,
          `🎉 Pagamento enviado! O valor de R$ ${Number(booking.price_original || 0).toFixed(2)} referente ao agendamento ${booking.codigo_confirmacao} foi transferido para você. Obrigado pela parceria!`
        )
      }
    } catch (waErr) {
      console.error('[mark-paid] WhatsApp notify error:', waErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Pagamento marcado como realizado com sucesso.',
    })
  } catch (e) {
    console.error('[PATCH /api/admin/pagamentos/[id]/mark-paid]', e)
    return apiError(e)
  }
}
