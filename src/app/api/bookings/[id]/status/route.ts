import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { sendWhatsApp } from '@/lib/wa'

const VALID_TRANSITIONS: Record<string, string[]> = {
  pendente: ['confirmado', 'cancelado'],
  confirmado: ['concluido', 'cancelado'],
  concluido: [],
  cancelado: [],
}

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
      .select('id, status, influencer_id, client_id, codigo_confirmacao, data_agendada')
      .eq('id', params.id)
      .eq('influencer_id', auth.influencer_id)
      .maybeSingle()

    if (!booking) return NextResponse.json({ error: 'NOT_FOUND: Agendamento nao encontrado' }, { status: 404 })

    const allowed = VALID_TRANSITIONS[booking.status] || []
    if (!allowed.includes(newStatus)) {
      return NextResponse.json({ error: 'Transicao de status invalida: ' + booking.status + ' -> ' + newStatus }, { status: 400 })
    }

    const { data: updated, error } = await db
      .from('bookings')
      .update({ status: newStatus as any })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    const { data: client } = await db
      .from('clients')
      .select('nome, whatsapp')
      .eq('id', booking.client_id)
      .maybeSingle()

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
        msg = 'Seu agendamento ' + booking.codigo_confirmacao + ' foi cancelado. Para reagendar: ' + appUrl + '/' + inf?.username
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

    return NextResponse.json({ booking: updated, mensagem_enviada })
  } catch (e) {
    console.error('[PATCH /api/bookings/[id]/status] Error:', e)
    return apiError(e)
  }
}
