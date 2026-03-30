import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { updateBookingStatusSchema } from '@/lib/schemas'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const { data, error } = await db
      .from('bookings')
      .select('*, services(preco, tipo), clients(nome, whatsapp, empresa), influencers(nome, username)')
      .order('data_agendada', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)

    const body = await req.json()
    const parsed = updateBookingStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { id, status } = parsed.data

    const { error } = await db
      .from('bookings')
      .update({ status } as any)
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ updated: true })
  } catch (e) {
    return apiError(e)
  }
}
