import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { parsePagination, paginatedResult } from '@/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const pagination = parsePagination(req, { sort: 'data_agendada', order: 'desc' })
    const offset = (pagination.page - 1) * pagination.limit

    const { data: clients } = await db
      .from('clients')
      .select('id')
      .eq('user_id', auth.user_id)

    if (!clients || clients.length === 0) {
      return NextResponse.json(paginatedResult([], 0, pagination))
    }

    const clientIds = clients.map(c => c.id)

    const [countRes, dataRes] = await Promise.all([
      db.from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('client_id', clientIds),
      db.from('bookings')
        .select('*, influencers(nome, foto_url, username), services(tipo, formato, preco, descricao)')
        .in('client_id', clientIds)
        .order(pagination.sort || 'data_agendada', { ascending: pagination.order === 'asc' })
        .range(offset, offset + pagination.limit - 1),
    ])

    if (dataRes.error) throw dataRes.error
    return NextResponse.json(paginatedResult(dataRes.data || [], countRes.count || 0, pagination))
  } catch (e) {
    return apiError(e)
  }
}
