import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // payment_status filter
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let query = db
      .from('bookings')
      .select(
        'id, codigo_confirmacao, payment_status, status, price_original, price_client, platform_fee, mp_fee, mp_payment_id, paid_at, released_at, completed_at, data_agendada, created_at, clients(nome, email, whatsapp), influencers(nome, username), services(tipo, preco)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1) as any

    if (status && status !== 'ALL') {
      query = query.eq('payment_status', status)
    }

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ data: data || [], total: count || 0, page, limit })
  } catch (e) {
    return apiError(e)
  }
}
