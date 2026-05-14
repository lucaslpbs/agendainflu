import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { updateWaitlistStatusSchema } from '@/lib/schemas'
import { parsePagination, paginatedResult } from '@/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const pagination = parsePagination(req, { sort: 'criado_em', order: 'desc' })
    const offset = (pagination.page - 1) * pagination.limit

    const [countRes, dataRes] = await Promise.all([
      db.from('waitlist').select('id', { count: 'exact', head: true }),
      db.from('waitlist')
        .select('*, influencers(nome, username)')
        .order(pagination.sort || 'criado_em', { ascending: pagination.order === 'asc' })
        .range(offset, offset + pagination.limit - 1),
    ])

    if (dataRes.error) throw dataRes.error
    return NextResponse.json(paginatedResult(dataRes.data || [], countRes.count || 0, pagination))
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)

    const body = await req.json()
    const parsed = updateWaitlistStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { id, status } = parsed.data

    const { error } = await db
      .from('waitlist')
      .update({ status } as any)
      .eq('id', id)

    if (error) throw error

    if (status === 'aprovado') {
      try {
        const webhookUrl = process.env.N8N_WEBHOOK_WAITLIST_APROVADO
        if (webhookUrl) {
          const { data: waitlistRecord } = await db
            .from('waitlist')
            .select('nome, whatsapp')
            .eq('id', id)
            .single()

          if (waitlistRecord?.whatsapp) {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                evento: 'waitlist_aprovado',
                nome: waitlistRecord.nome,
                whatsapp: waitlistRecord.whatsapp,
              }),
            })
          }
        }
      } catch (waErr) {
        console.error('[notify] waitlist_aprovado:', waErr)
      }
    }

    return NextResponse.json({ updated: true })
  } catch (e) {
    return apiError(e)
  }
}
