import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { parsePagination, paginatedResult } from '@/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const pagination = parsePagination(req, { sort: 'created_at', order: 'desc' })
    const offset = (pagination.page - 1) * pagination.limit

    const [countRes, dataRes] = await Promise.all([
      db.from('clients').select('id', { count: 'exact', head: true }),
      db.from('clients')
        .select('*, influencers(nome, username)')
        .order(pagination.sort || 'created_at', { ascending: pagination.order === 'asc' })
        .range(offset, offset + pagination.limit - 1),
    ])

    if (dataRes.error) throw dataRes.error
    return NextResponse.json(paginatedResult(dataRes.data || [], countRes.count || 0, pagination))
  } catch (e) {
    return apiError(e)
  }
}
