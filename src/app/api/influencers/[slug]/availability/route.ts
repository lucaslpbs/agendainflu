import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'
import { addDays, format } from 'date-fns'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '14')

    // slug can be either a UUID (influencer_id) or username
    let influencerId = slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
    if (!isUUID) {
      const { data: inf } = await db.from('influencers').select('id').eq('username', slug).maybeSingle()
      if (!inf) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
      influencerId = inf.id
    }

    const dates = Array.from({ length: days }, (_, i) =>
      format(addDays(new Date(), i + 2), 'yyyy-MM-dd')
    )

    const [avRes, bkRes] = await Promise.all([
      db.from('availability')
        .select('*')
        .eq('influencer_id', influencerId)
        .in('data', dates),
      db.from('bookings')
        .select('data_agendada, service_id')
        .eq('influencer_id', influencerId)
        .in('data_agendada', dates)
        .in('status', ['pendente', 'confirmado']),
    ])

    // [FIX P10] max_por_dia de services (fonte única)
    const { data: services } = await db
      .from('services')
      .select('id, max_por_dia')
      .eq('influencer_id', influencerId)
      .eq('ativo', true)

    const maxPorDia = (services || []).reduce((acc, s) => {
      acc[s.id] = s.max_por_dia || 1
      return acc
    }, {} as Record<string, number>)

    const result = dates.map(date => {
      const av = avRes.data?.find(a => a.data === date)
      const dayBookings = bkRes.data?.filter(b => b.data_agendada === date) || []
      const slotsDisponiveis = av?.slots_disponiveis ?? 3
      const bloqueado = av?.bloqueado ?? false
      const ocupados = dayBookings.length

      return {
        data: date,
        disponivel: !bloqueado && ocupados < slotsDisponiveis,
        bloqueado,
        slots_disponiveis: slotsDisponiveis,
        slots_ocupados: ocupados,
      }
    })

    return NextResponse.json({ data: result })
  } catch (e) {
    return apiError(e)
  }
}
