import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'

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

    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'id e status obrigatórios' }, { status: 400 })

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
