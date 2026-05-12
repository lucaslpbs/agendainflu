import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { updateBookingStatusSchema } from '@/lib/schemas'
import { parsePagination, paginatedResult } from '@/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const pagination = parsePagination(req, { sort: 'data_agendada', order: 'desc' })
    const offset = (pagination.page - 1) * pagination.limit

    const [countRes, dataRes] = await Promise.all([
      db.from('bookings').select('id', { count: 'exact', head: true }),
      db.from('bookings')
        .select('*, services(preco, tipo), clients(nome, whatsapp, empresa), influencers(nome, username)')
        .order(pagination.sort || 'data_agendada', { ascending: pagination.order === 'asc' })
        .range(offset, offset + pagination.limit - 1),
    ])

    if (dataRes.error) throw dataRes.error
    return NextResponse.json(paginatedResult(dataRes.data || [], countRes.count || 0, pagination))
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)

    const body = await req.json()
    const parsed = updateBookingStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { id, status } = parsed.data

    const { error } = await db
      .from('bookings')
      .update({ status } as any)
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ updated: true })
  } catch (e) {
    return apiError(e)
  }
}
