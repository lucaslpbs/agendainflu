import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const { data: clients } = await db
      .from('clients')
      .select('id')
      .eq('user_id', auth.user_id)

    if (!clients || clients.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const clientIds = clients.map(c => c.id)

    const { data, error } = await db
      .from('bookings')
      .select('*, influencers(nome, foto_url, username), services(tipo, formato, preco, descricao)')
      .in('client_id', clientIds)
      .order('data_agendada', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return apiError(e)
  }
}
