import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'

const mesParamSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
  message: 'mes must be in YYYY-MM format with month 01-12',
})

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
      const parsed = mesParamSchema.safeParse(mes)
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors.map(e => e.message).join(', ') },
          { status: 400 }
        )
      }

      const [year, month] = mes.split('-').map(Number)
      const start = mes + '-01'
      // new Date(year, month, 0) returns the last day of the given month
      // because day 0 of month N+1 is the last day of month N
      const lastDay = new Date(year, month, 0).getDate()
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
