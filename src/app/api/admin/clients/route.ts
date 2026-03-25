import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { apiError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const { data, error } = await db
      .from('clients')
      .select('*, influencers(nome, username)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return apiError(e)
  }
}
