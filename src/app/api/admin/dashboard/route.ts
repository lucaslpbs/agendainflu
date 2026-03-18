import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const [infRes, bkRes, clRes, wlRes] = await Promise.all([
      db.from('influencers').select('id, status'),
      db.from('bookings').select('*, services(preco, tipo), clients(nome), influencers(nome)').order('data_agendada', { ascending: false }).limit(200),
      db.from('clients').select('id', { count: 'exact', head: true }),
      db.from('waitlist').select('id', { count: 'exact', head: true }),
    ])

    const allBookings = bkRes.data || []
    const receita = allBookings
      .filter((b: any) => b.status === 'confirmado' || b.status === 'concluido')
      .reduce((sum: number, b: any) => sum + (b.services?.preco || 0), 0)

    return NextResponse.json({
      stats: {
        influencers: infRes.data?.filter(i => i.status === 'ativa').length || 0,
        emAnalise: infRes.data?.filter(i => i.status === 'em_analise').length || 0,
        bookings: allBookings.length,
        clients: clRes.count || 0,
        waitlist: wlRes.count || 0,
        receita,
      },
      recentBookings: allBookings.slice(0, 10),
      allBookings,
    })
  } catch (e) {
    return apiError(e)
  }
}
