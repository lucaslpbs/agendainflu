import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { parsePagination, paginatedResult } from '@/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const pagination = parsePagination(req, { sort: 'data_agendada', order: 'desc' })
    const offset = (pagination.page - 1) * pagination.limit

    const [infRes, bkCountRes, bkPageRes, receitaRes, clRes, wlRes, paymentRes] = await Promise.all([
      db.from('influencers').select('id, status'),
      db.from('bookings').select('id', { count: 'exact', head: true }),
      db.from('bookings')
        .select('*, services(preco, tipo), clients(nome), influencers(nome)')
        .order(pagination.sort || 'data_agendada', { ascending: pagination.order === 'asc' })
        .range(offset, offset + pagination.limit - 1),
      db.from('bookings')
        .select('services(preco), status')
        .in('status', ['confirmado', 'concluido']),
      db.from('clients').select('id', { count: 'exact', head: true }),
      db.from('waitlist').select('id', { count: 'exact', head: true }),
      db.from('bookings').select('payment_status, price_client, platform_fee, price_original') as any,
    ])

    const receita = (receitaRes.data || [])
      .reduce((sum: number, b: any) => sum + (b.services?.preco || 0), 0)

    const paymentRows: any[] = (paymentRes as any).data || []
    const volumeTotal = paymentRows
      .filter((b: any) => b.payment_status && b.payment_status !== 'PENDING_PAYMENT' && b.payment_status !== 'CANCELLED')
      .reduce((s: number, b: any) => s + Number(b.price_client || 0), 0)
    const comissaoRetida = paymentRows
      .filter((b: any) => b.payment_status === 'COMPLETED')
      .reduce((s: number, b: any) => s + Number(b.platform_fee || 0), 0)
    const emCustodia = paymentRows
      .filter((b: any) => b.payment_status === 'PAID' || b.payment_status === 'IN_PROGRESS')
      .reduce((s: number, b: any) => s + Number(b.price_client || 0), 0)

    const totalBookings = bkCountRes.count || 0
    const bookings = paginatedResult(bkPageRes.data || [], totalBookings, pagination)

    return NextResponse.json({
      stats: {
        influencers: infRes.data?.filter(i => i.status === 'ativa').length || 0,
        emAnalise: infRes.data?.filter(i => i.status === 'em_analise').length || 0,
        bookings: totalBookings,
        clients: clRes.count || 0,
        waitlist: wlRes.count || 0,
        receita,
        volumeTotal,
        comissaoRetida,
        emCustodia,
      },
      recentBookings: (bkPageRes.data || []).slice(0, 10),
      allBookings: bookings,
    })
  } catch (e) {
    return apiError(e)
  }
}
