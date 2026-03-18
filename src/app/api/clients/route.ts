import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) return NextResponse.json({ error: 'Sem influencer_id' }, { status: 400 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const busca = searchParams.get('busca')

    let query = db
      .from('clients')
      .select('*')
      .eq('influencer_id', auth.influencer_id)
      .order('criado_em', { ascending: false })

    if (status) query = query.eq('status', status as any)
    if (busca) query = query.or('nome.ilike.%' + busca + '%,empresa.ilike.%' + busca + '%,whatsapp.ilike.%' + busca + '%')

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data || [] })
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
