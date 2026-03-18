import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { apiError } from '@/lib/errors'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const auth = await getAuthUser(req)

    const { data: influencer, error } = await db
      .from('influencers')
      .select('*')
      .eq('username', slug)
      .eq('status', 'ativa')
      .maybeSingle()

    if (error) throw error
    if (!influencer) {
      return NextResponse.json({ error: 'NOT_FOUND: Influenciadora não encontrada' }, { status: 404 })
    }

    const { data: services } = await db
      .from('services')
      .select('*')
      .eq('influencer_id', influencer.id)
      .eq('ativo', true)
      .order('tipo')

    // Sem autenticação: ocultar preços
    const servicesData = (services || []).map(s => ({
      ...s,
      preco: auth ? s.preco : null,
    }))

    return NextResponse.json({ influencer, services: servicesData })
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const auth = await getAuthUser(req)

    const { data: inf } = await db
      .from('influencers')
      .select('id, user_id')
      .eq('username', slug)
      .maybeSingle()

    if (!inf) return NextResponse.json({ error: 'NOT_FOUND: Influenciadora não encontrada' }, { status: 404 })

    // Apenas a própria influencer ou admin pode editar
    if (!auth || (auth.user_id !== inf.user_id && auth.role !== 'admin')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const body = await req.json()
    const allowed = ['bio', 'nicho', 'seguidores', 'foto_url', 'instagram_url', 'whatsapp', 'nome']
    const update: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) update[key] = body[key]
    }

    const { data, error } = await db
      .from('influencers')
      .update(update)
      .eq('id', inf.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return apiError(e)
  }
}
