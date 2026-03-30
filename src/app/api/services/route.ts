import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { createServiceSchema } from '@/lib/schemas'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const influencer_id = searchParams.get('influencer_id')
    if (!influencer_id) {
      return NextResponse.json({ error: 'influencer_id obrigatório' }, { status: 400 })
    }

    const { data, error } = await db
      .from('services')
      .select('*')
      .eq('influencer_id', influencer_id)
      .eq('ativo', true)
      .order('tipo')

    if (error) throw error
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) {
      return NextResponse.json({ error: 'Perfil de influencer não encontrado' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = createServiceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { tipo, formato, preco, descricao, max_por_dia } = parsed.data

    const { data, error } = await db
      .from('services')
      .insert({
        influencer_id: auth.influencer_id,
        tipo,
        formato,
        preco,
        descricao: descricao || null,
        max_por_dia,
        ativo: true,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
