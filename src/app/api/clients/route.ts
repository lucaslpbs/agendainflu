import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { parsePagination, paginatedResult } from '@/lib/pagination'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) return NextResponse.json({ error: 'Sem influencer_id' }, { status: 400 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const busca = searchParams.get('busca')

    const pagination = parsePagination(req, { sort: 'created_at', order: 'desc' })
    const offset = (pagination.page - 1) * pagination.limit

    let countQuery = db
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('influencer_id', auth.influencer_id)

    let dataQuery = db
      .from('clients')
      .select('*')
      .eq('influencer_id', auth.influencer_id)
      .order(pagination.sort || 'created_at', { ascending: pagination.order === 'asc' })
      .range(offset, offset + pagination.limit - 1)

    if (status) {
      countQuery = countQuery.eq('status', status as any)
      dataQuery = dataQuery.eq('status', status as any)
    }
    if (busca) {
      const filter = 'nome.ilike.%' + busca + '%,empresa.ilike.%' + busca + '%,whatsapp.ilike.%' + busca + '%'
      countQuery = countQuery.or(filter)
      dataQuery = dataQuery.or(filter)
    }

    const [countRes, dataRes] = await Promise.all([countQuery, dataQuery])
    if (dataRes.error) throw dataRes.error

    return NextResponse.json(paginatedResult(dataRes.data || [], countRes.count || 0, pagination))
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) return NextResponse.json({ error: 'Sem influencer_id' }, { status: 400 })

    const body = await req.json()
    const { nome, whatsapp, email, empresa, notas } = body

    if (!nome || !whatsapp) {
      return NextResponse.json({ error: 'nome e whatsapp sao obrigatorios' }, { status: 400 })
    }

    const { data: existing } = await db
      .from('clients')
      .select('id')
      .eq('influencer_id', auth.influencer_id)
      .eq('whatsapp', whatsapp)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'CONFLICT: Cliente com este WhatsApp ja cadastrado' }, { status: 409 })
    }

    const { data, error } = await db
      .from('clients')
      .insert({
        influencer_id: auth.influencer_id,
        nome,
        whatsapp,
        email: email || null,
        empresa: empresa || null,
        notas: notas || null,
        status: 'ativo',
        origem: 'cadastro_manual',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
