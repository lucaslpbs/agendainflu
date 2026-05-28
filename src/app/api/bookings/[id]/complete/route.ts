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
      .select('id, status, payment_status, influencer_id, client_id, mp_payment_id, price_original, price_client, codigo_confirmacao, clients(*), influencers(username, nome, whatsapp, mp_connected, mp_user_id)')
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

    const influencer = booking.influencers as any
    if (!influencer?.mp_connected || !influencer?.mp_user_id) {
      return NextResponse.json(
        { error: 'Você precisa conectar sua conta do Mercado Pago antes de concluir o agendamento. Acesse Perfil > Mercado Pago para conectar.' },
        { status: 422 },
      )
    }

    // Mark as completed in DB (AWAITING_TRANSFER até confirmar a transferência)
    await db
      .from('bookings')
      .update({
        payment_status: 'AWAITING_TRANSFER',
        status: 'concluido',
        completed_at: new Date().toISOString(),
      } as any)
      .eq('id', params.id)

    // Audit log da conclusão
    await db.from('payment_transactions' as any).insert({
      booking_id: params.id,
      mp_payment_id: booking.mp_payment_id || null,
      type: 'release',
      amount: booking.price_original || 0,
      status: 'released',
      mp_response: { note: 'marked_complete_by_influencer', booking_id: params.id },
    })

    // Tenta transferir automaticamente para o MP do influencer
    const transferAmount = Number(booking.price_original || 0)
    let transferSuccess = false

    if (transferAmount > 0) {
      try {
        await transferToInfluencer({
          influencerMpUserId: influencer.mp_user_id,
          amount: transferAmount,
          bookingId: params.id,
        })

        // Transferência OK — finaliza o booking e registra
        await db
          .from('bookings')
          .update({ payment_status: 'COMPLETED', released_at: new Date().toISOString() } as any)
          .eq('id', params.id)

        await db.from('payment_transactions' as any).insert({
          booking_id: params.id,
          mp_payment_id: booking.mp_payment_id || null,
          type: 'manual_transfer',
          amount: transferAmount,
          status: 'transferred',
          mp_response: { note: 'auto_transfer_on_complete', booking_id: params.id },
        })

        transferSuccess = true
      } catch (transferErr) {
        const errMsg = transferErr instanceof Error ? transferErr.message : String(transferErr)
        const errStack = transferErr instanceof Error ? transferErr.stack : undefined
        console.error('[complete] Falha na transferência automática MP — mensagem:', errMsg)
        if (errStack) console.error('[complete] Stack:', errStack)

        await db.from('payment_transactions' as any).insert({
          booking_id: params.id,
          mp_payment_id: booking.mp_payment_id || null,
          type: 'manual_transfer',
          amount: transferAmount,
          status: 'failed',
          mp_response: { error: errMsg, note: 'auto_transfer_failed', booking_id: params.id },
        })
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    // Notifica admin: se a transferência falhou, exige ação manual; senão avisa que foi automática
    try {
      const adminWa = process.env.ADMIN_WHATSAPP
      if (adminWa) {
        const adminMsg = transferSuccess
          ? `✅ Transferência automática realizada! @${influencer?.username || ''} concluiu o agendamento ${booking.codigo_confirmacao}. Valor de R$ ${transferAmount.toFixed(2)} transferido automaticamente via Mercado Pago.`
          : `💰 Pagamento pendente! A influenciadora @${influencer?.username || ''} concluiu o agendamento ${booking.codigo_confirmacao}. A transferência automática falhou — realize o pagamento de R$ ${transferAmount.toFixed(2)} manualmente no painel: ${appUrl}/admin/financeiro`
        await sendWhatsApp(adminWa, adminMsg)
      }
    } catch (adminWaErr) {
      console.error('[complete] Admin WhatsApp notify error:', adminWaErr)
    }

    // Notifica cliente
    try {
      const clientWa = booking.clients?.whatsapp
      if (clientWa) {
        await sendWhatsApp(
          clientWa,
          `Divulgação concluída! Seu agendamento ${booking.codigo_confirmacao} foi marcado como concluído. Agradecemos a parceria! Deixe sua avaliação em: ${appUrl}`,
        )
      }
    } catch (waErr) {
      console.error('[complete] WhatsApp notify error:', waErr)
    }

    // Notifica influencer se a transferência foi automática
    if (transferSuccess) {
      try {
        const infWa = influencer?.whatsapp
        if (infWa) {
          await sendWhatsApp(
            infWa,
            `🎉 Pagamento enviado! O valor de R$ ${transferAmount.toFixed(2)} referente ao agendamento ${booking.codigo_confirmacao} foi transferido para sua conta Mercado Pago. Obrigado pela parceria!`,
          )
        }
      } catch (waErr) {
        console.error('[complete] Influencer WhatsApp notify error:', waErr)
      }
    }

    return NextResponse.json({ success: true, message: 'Divulgação marcada como concluída. Pagamento liberado.' })
  } catch (e) {
    console.error('[POST /api/bookings/[id]/complete]', e)
    return apiError(e)
  }
}
