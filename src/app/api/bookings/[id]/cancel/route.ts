import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { addDays, format } from 'date-fns'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req)

    // Buscar o booking e verificar se pertence ao cliente
    const { data: clients } = await db
      .from('clients')
      .select('id')
      .eq('user_id', auth.user_id)

    if (!clients || clients.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const clientIds = clients.map(c => c.id)

    const { data: booking } = await db
      .from('bookings')
      .select('id, status, data_agendada, client_id, influencer_id, codigo_confirmacao')
      .eq('id', params.id)
      .in('client_id', clientIds)
      .maybeSingle()

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    // Só pode cancelar pendente ou confirmado
    if (!['pendente', 'confirmado'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Não é possível cancelar um agendamento ' + booking.status },
        { status: 400 }
      )
    }

    // Verificar antecedência mínima de 2 dias
    const minDate = format(addDays(new Date(), 2), 'yyyy-MM-dd')
    if (booking.data_agendada < minDate) {
      return NextResponse.json(
        { error: 'Cancelamento só é permitido com no mínimo 2 dias de antecedência' },
        { status: 400 }
      )
    }

    // Cancelar o booking
    const { error } = await db
      .from('bookings')
      .update({ status: 'cancelado' } as any)
      .eq('id', params.id)

    if (error) throw error

    // Notificar influencer via WhatsApp
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
            data_agendada: new Date(booking.data_agendada + 'T12:00:00')
              .toLocaleDateString('pt-BR'),
          }),
        })
      }
    } catch (waErr) {
      console.error('[notify] agendamento_cancelado_cliente:', waErr)
    }

    return NextResponse.json({ cancelled: true })
  } catch (e) {
    return apiError(e)
  }
}
