import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireInfluencer, getAuthUser } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { sendWhatsApp } from '@/lib/wa'
import { createWaitlistSchema } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createWaitlistSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { influencer_id, nome, whatsapp, email, empresa, mensagem } = parsed.data

    // Verificar se ja e cliente ativo
    if (influencer_id) {
      const { data: isClient } = await db
        .from('clients')
        .select('id')
        .eq('influencer_id', influencer_id)
        .eq('whatsapp', whatsapp)
        .eq('status', 'ativo')
        .maybeSingle()

      if (isClient) {
        return NextResponse.json({ redirect: 'booking', message: 'Voce ja pode agendar!' })
      }
    }

    // Verificar se ja esta na fila
    const { data: existing } = await db
      .from('waitlist')
      .select('id')
      .eq('influencer_id', influencer_id || '')
      .eq('whatsapp', whatsapp)
      .not('status', 'eq', 'rejeitado')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ message: 'Voce ja esta na lista de espera!' })
    }

    const { error } = await db
      .from('waitlist')
      .insert({
        influencer_id: influencer_id || null,
        nome,
        whatsapp,
        email: email || null,
        empresa: empresa || null,
        mensagem: mensagem || null,
        status: 'aguardando',
      })

    if (error) throw error

    let infNome = 'a influenciadora'
    if (influencer_id) {
      const { data: inf } = await db
        .from('influencers')
        .select('nome, whatsapp')
        .eq('id', influencer_id)
        .maybeSingle()
      if (inf) {
        infNome = inf.nome
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
        await sendWhatsApp(inf.whatsapp || '', 'Nova entrada na lista de espera! Nome: ' + nome + ' | Empresa: ' + (empresa || '-') + ' | WA: ' + whatsapp + ' | ' + appUrl + '/painel/lista-espera')
      }
    }

    await sendWhatsApp(whatsapp, 'Ola, ' + nome + '! Recebemos seu interesse em divulgar com ' + infNome + '. Voce entrou na lista de espera e sera contatado(a) em breve.')

    return NextResponse.json({ message: 'Solicitacao recebida!' }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) return NextResponse.json({ error: 'Sem influencer_id' }, { status: 400 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let query = db
      .from('waitlist')
      .select('*')
      .eq('influencer_id', auth.influencer_id)
      .order('criado_em', { ascending: false })

    if (status) query = query.eq('status', status as any)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return apiError(e)
  }
}
