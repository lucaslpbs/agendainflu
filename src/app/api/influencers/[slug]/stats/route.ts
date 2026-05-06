import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    const { data: inf, error: infErr } = await db
      .from('influencers')
      .select('id')
      .eq('username', slug)
      .maybeSingle()

    if (infErr) throw infErr
    if (!inf) {
      return NextResponse.json({ error: 'Influenciadora não encontrada' }, { status: 404 })
    }

    const { data: bookings, error: bErr } = await db
      .from('bookings')
      .select('id, status, client_id, service_id, services(preco)')
      .eq('influencer_id', inf.id)

    if (bErr) throw bErr

    const all = bookings || []
    const total_bookings = all.length
    const completed = all.filter(b => b.status === 'concluido')
    const completed_bookings = completed.length

    const clientSet = new Set(completed.map(b => b.client_id).filter(Boolean))
    const unique_clients = clientSet.size

    const revenue_statuses = ['confirmado', 'concluido']
    const total_revenue = all
      .filter(b => revenue_statuses.includes(b.status))
      .reduce((sum, b) => {
        const svc = b.services as { preco: number | null } | null
        return sum + (svc?.preco ?? 0)
      }, 0)

    const conversion_rate =
      total_bookings > 0
        ? Math.round((completed_bookings / total_bookings) * 1000) / 10
        : 0

    return NextResponse.json(
      { total_bookings, completed_bookings, unique_clients, total_revenue, conversion_rate },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch (e) {
    return apiError(e)
  }
}
