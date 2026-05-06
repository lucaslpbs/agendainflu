import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/errors'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const nicho = searchParams.get('nicho')
    const busca = searchParams.get('busca')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = db
      .from('influencers')
      .select('id, username, nome, bio, nicho, seguidores, foto_url, status')
      .eq('status', 'ativa')
      .limit(limit)

    if (nicho) query = query.ilike('nicho', `%${nicho}%`)
    if (busca) query = query.or(`nome.ilike.%${busca}%,username.ilike.%${busca}%`)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error

    return NextResponse.json({ data: data || [] }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (e) {
    return apiError(e)
  }
}
