import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { parsePagination, paginatedResult } from '@/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'em_analise'
    const pagination = parsePagination(req, { sort: 'created_at', order: 'asc' })
    const offset = (pagination.page - 1) * pagination.limit

    let countQuery = db.from('influencers').select('id', { count: 'exact', head: true })
    let dataQuery = db.from('influencers')
      .select('*')
      .order(pagination.sort || 'created_at', { ascending: pagination.order === 'asc' })
      .range(offset, offset + pagination.limit - 1)

    if (status !== 'todas') {
      countQuery = countQuery.eq('status', status as any)
      dataQuery = dataQuery.eq('status', status as any)
    }

    const [countRes, dataRes] = await Promise.all([countQuery, dataQuery])

    if (dataRes.error) throw dataRes.error
    return NextResponse.json(paginatedResult(dataRes.data || [], countRes.count || 0, pagination))
  } catch (e) {
    return apiError(e)
  }
}
