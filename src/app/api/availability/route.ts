import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) return NextResponse.json({ error: 'Sem influencer_id' }, { status: 400 })

    const { searchParams } = new URL(req.url)
    const mes = searchParams.get('mes')

    let query = db
      .from('availability')
      .select('*')
      .eq('influencer_id', auth.influencer_id)

    if (mes) {
      const [year, month] = mes.split('-')
      const start = mes + '-01'
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      const end = mes + '-' + String(lastDay).padStart(2, '0')
      query = query.gte('data', start).lte('data', end)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) return NextResponse.json({ error: 'Sem influencer_id' }, { status: 400 })

    const body = await req.json()
    const { data: date, bloqueado, slots_disponiveis } = body

    if (!date) return NextResponse.json({ error: 'data obrigatoria' }, { status: 400 })

    const { error } = await db
      .from('availability')
      .upsert({
        influencer_id: auth.influencer_id,
        data: date,
        bloqueado: bloqueado ?? false,
        slots_disponiveis: slots_disponiveis ?? 1,
      }, { onConflict: 'influencer_id,data' })

    if (error) throw error
    return NextResponse.json({ updated: true })
  } catch (e) {
    return apiError(e)
  }
}
