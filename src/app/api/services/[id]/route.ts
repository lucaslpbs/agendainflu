import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'

async function verifyOwnership(serviceId: string, influencerId: string) {
  const { data } = await db
    .from('services')
    .select('id')
    .eq('id', serviceId)
    .eq('influencer_id', influencerId)
    .maybeSingle()
  return !!data
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) {
      return NextResponse.json({ error: 'Perfil de influencer não encontrado' }, { status: 400 })
    }

    const owned = await verifyOwnership(params.id, auth.influencer_id)
    if (!owned) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

    const body = await req.json()
    const allowed = ['tipo', 'formato', 'preco', 'descricao', 'max_por_dia', 'ativo']
    const update: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) {
        update[key] = key === 'preco' ? parseFloat(body[key]) :
                      key === 'max_por_dia' ? parseInt(body[key]) :
                      body[key]
      }
    }

    const { data, error } = await db
      .from('services')
      .update(update)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) {
      return NextResponse.json({ error: 'Perfil de influencer não encontrado' }, { status: 400 })
    }

    const owned = await verifyOwnership(params.id, auth.influencer_id)
    if (!owned) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

    // Verificar se tem bookings — soft delete se tiver
    const { count } = await db
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', params.id)

    if ((count || 0) > 0) {
      await db.from('services').update({ ativo: false }).eq('id', params.id)
      return NextResponse.json({ deleted: true, tipo: 'soft' })
    }

    await db.from('services').delete().eq('id', params.id)
    return NextResponse.json({ deleted: true, tipo: 'hard' })
  } catch (e) {
    return apiError(e)
  }
}
