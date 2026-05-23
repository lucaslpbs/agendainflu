import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiError } from '@/lib/errors'

// Aborta um booking PENDING_PAYMENT recém-criado quando o pagamento falha ao inicializar.
// Sem restrição de antecedência — só permite cancelar bookings que ainda não foram pagos.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req)

    const { data: clients } = await db
      .from('clients')
      .select('id')
      .eq('user_id', auth.user_id)

    const clientIds = (clients || []).map((c) => c.id)
    if (clientIds.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const { data: booking } = await db
      .from('bookings')
      .select('id, payment_status, client_id')
      .eq('id', params.id)
      .in('client_id', clientIds)
      .maybeSingle() as any

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    // Só permite abortar se ainda não foi pago
    if (booking.payment_status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ error: 'Não é possível abortar um agendamento já pago' }, { status: 400 })
    }

    await db
      .from('bookings')
      .update({ status: 'cancelado', payment_status: 'CANCELLED' } as any)
      .eq('id', params.id)

    return NextResponse.json({ aborted: true })
  } catch (e) {
    return apiError(e)
  }
}
