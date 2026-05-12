import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { updateClientStatusSchema } from '@/lib/schemas'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) return NextResponse.json({ error: 'Sem influencer_id' }, { status: 400 })

    const body = await req.json()
    const parsed = updateClientStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { status } = parsed.data

    const { data: client } = await db
      .from('clients')
      .select('id')
      .eq('id', params.id)
      .eq('influencer_id', auth.influencer_id)
      .maybeSingle()

    if (!client) return NextResponse.json({ error: 'NOT_FOUND: Cliente nao encontrado' }, { status: 404 })

    const { error } = await db
      .from('clients')
      .update({ status } as any)
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ updated: true })
  } catch (e) {
    return apiError(e)
  }
}
