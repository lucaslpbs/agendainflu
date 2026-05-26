import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { sendWhatsApp } from '@/lib/wa'
import { transferToInfluencer } from '@/lib/mercadopago'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) {
      return NextResponse.json({ error: 'Perfil de influencer não encontrado' }, { status: 400 })
    }

    const { data: booking } = await db
      .from('bookings')
      .select('id, status, payment_status, influencer_id, client_id, mp_payment_id, price_original, price_client, codigo_confirmacao, clients(*)')
      .eq('id', params.id)
      .eq('influencer_id', auth.influencer_id)
      .maybeSingle() as any

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    if (booking.payment_status !== 'PAID' && booking.payment_status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Agendamento não está com pagamento confirmado' },
        { status: 400 },
      )
    }

    // Mark as completed in DB
    await db
      .from('bookings')
      .update({
        payment_status: 'COMPLETED',
        status: 'concluido',
        released_at: new Date().toISOString(),
      } as any)
      .eq('id', params.id)

    // Audit log
    await db.from('payment_transactions' as any).insert({
      booking_id: params.id,
      mp_payment_id: booking.mp_payment_id || null,
      type: 'release',
      amount: booking.price_original || 0,
      status: 'released',
      mp_response: { note: 'marked_complete_by_influencer', booking_id: params.id },
    })

    // Transferir valor para a influenciadora via Mercado Pago
    const influencerMpUserId = booking.influencer_mp_id || (booking as any).influencers?.mp_user_id
    const amountToTransfer = booking.price_original || 0
    if (influencerMpUserId && amountToTransfer > 0) {
      try {
        await transferToInfluencer({
          influencerMpUserId: String(influencerMpUserId),
          amount: amountToTransfer,
          bookingId: params.id,
        })
        // Log da transferência
        await db.from('payment_transactions' as any).insert({
          booking_id: params.id,
          mp_payment_id: booking.mp_payment_id || null,
          type: 'transfer',
          amount: amountToTransfer,
          status: 'transferred',
          mp_response: { note: 'transfer_to_influencer', influencer_mp_user_id: influencerMpUserId },
        })
      } catch (transferErr) {
        console.error('[complete] Erro na transferência MP:', transferErr)
        // Não falha o request — booking já foi marcado como concluído
        // Admin deve verificar manualmente no painel financeiro
      }
    } else {
      console.warn('[complete] Transferência MP pulada — influencer sem mp_user_id ou valor zerado', {
        bookingId: params.id,
        influencerMpUserId,
        amountToTransfer,
      })
    }

    // Notify client
    try {
      const clientWa = booking.clients?.whatsapp
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
      if (clientWa) {
        await sendWhatsApp(
          clientWa,
          `Divulgação concluída! Seu agendamento ${booking.codigo_confirmacao} foi marcado como concluído. Agradecemos a parceria! Deixe sua avaliação em: ${appUrl}`,
        )
      }
    } catch (waErr) {
      console.error('[complete] WhatsApp notify error:', waErr)
    }

    return NextResponse.json({ success: true, message: 'Divulgação marcada como concluída. Pagamento liberado.' })
  } catch (e) {
    console.error('[POST /api/bookings/[id]/complete]', e)
    return apiError(e)
  }
}
