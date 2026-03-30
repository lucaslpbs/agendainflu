import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireInfluencer } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import { generateBookingCode } from '@/lib/booking-code'
import { sendWhatsApp } from '@/lib/wa'
import { format, addDays } from 'date-fns'
import { createBookingSchema } from '@/lib/schemas'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const rl = rateLimit(req, { key: `bookings:${auth.user_id}`, limit: 5, windowMs: 60_000 })
    if (rl) return rl
    const body = await req.json()
    const parsed = createBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { influencer_id, service_id, data_agendada, descricao_produto, link_negocio, material_url, observacoes } = parsed.data

    const materialUrls: string[] = Array.isArray(material_url) ? material_url : []
    const minDate = format(addDays(new Date(), 2), 'yyyy-MM-dd')
    if (data_agendada < minDate) {
      return NextResponse.json({ error: 'Agendamento minimo com 2 dias de antecedencia' }, { status: 400 })
    }

    const { data: cp } = await db
      .from('client_profiles' as any)
      .select('whatsapp, nome, razao_social')
      .eq('user_id', auth.user_id)
      .maybeSingle()

    const clientWa: string = (cp as any)?.whatsapp || ''

    let clientRow: any = null
    if (clientWa) {
      const { data: ec } = await db
        .from('clients')
        .select('id, nome, empresa, status')
        .eq('influencer_id', influencer_id)
        .eq('whatsapp', clientWa)
        .eq('status', 'ativo')
        .maybeSingle()
      clientRow = ec
    }

    if (!clientRow) {
      const { data: ecByUser } = await db
        .from('clients')
        .select('id, nome, empresa, status')
        .eq('influencer_id', influencer_id)
        .eq('user_id', auth.user_id)
        .maybeSingle()
      clientRow = ecByUser
    }

    let client_id: string
    if (!clientRow) {
      const { data: newClient, error: clientErr } = await db
        .from('clients')
        .insert({
          influencer_id,
          user_id: auth.user_id,
          nome: (cp as any)?.nome || auth.email?.split('@')[0] || 'Cliente',
          whatsapp: clientWa,
          email: auth.email || '',
          empresa: (cp as any)?.razao_social || null,
          status: 'espera',
          origem: 'site',
        })
        .select('id')
        .single()
      if (clientErr) throw clientErr
      client_id = newClient.id
    } else {
      client_id = clientRow.id
    }

    const { data: av } = await db
      .from('availability')
      .select('slots_disponiveis, bloqueado')
      .eq('influencer_id', influencer_id)
      .eq('data', data_agendada)
      .maybeSingle()

    const slots = av?.slots_disponiveis ?? 3
    const bloqueado = av?.bloqueado ?? false

    const { count: ocupados } = await db
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('influencer_id', influencer_id)
      .eq('service_id', service_id)
      .eq('data_agendada', data_agendada)
      .in('status', ['pendente', 'confirmado'])

    if (bloqueado || (ocupados || 0) >= slots) {
      return NextResponse.json({ error: 'Data nao disponivel para este servico' }, { status: 409 })
    }

    const { data: service } = await db
      .from('services')
      .select('tipo, formato, preco')
      .eq('id', service_id)
      .eq('ativo', true)
      .eq('influencer_id', influencer_id)
      .maybeSingle()

    if (!service) {
      return NextResponse.json({ error: 'NOT_FOUND: Servico nao encontrado' }, { status: 404 })
    }

    const codigo_confirmacao = await generateBookingCode()

    const { data: booking, error: bkErr } = await db
      .from('bookings')
      .insert({
        influencer_id,
        client_id,
        service_id,
        data_agendada,
        codigo_confirmacao,
        descricao_produto,
        link_negocio: link_negocio || null,
        material_url: materialUrls.length > 0 ? materialUrls : null,
        observacoes: observacoes || null,
        status: clientRow?.status === 'ativo' ? 'confirmado' : 'pendente',
      })
      .select()
      .single()

    if (bkErr) throw bkErr

    const { data: inf } = await db
      .from('influencers')
      .select('nome, whatsapp, username')
      .eq('id', influencer_id)
      .maybeSingle()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const clientNome = clientRow?.nome || (cp as any)?.nome || 'Cliente'
    const clientEmpresa = clientRow?.empresa || (cp as any)?.razao_social || ''
    const dataFormatada = new Date(data_agendada + 'T12:00:00').toLocaleDateString('pt-BR')
    const valorFormatado = 'R$ ' + Number(service.preco).toFixed(2)

    await Promise.all([
      clientWa ? sendWhatsApp(clientWa, 'Pedido recebido, ' + clientNome + '! Agendamento com ' + inf?.nome + ' registrado. Data: ' + dataFormatada + ' | Servico: ' + service.tipo + ' | Valor: ' + valorFormatado + ' | Codigo: ' + codigo_confirmacao) : Promise.resolve(false),
      inf?.whatsapp ? sendWhatsApp(inf.whatsapp, 'Novo agendamento! ' + clientNome + ' | ' + clientEmpresa + ' | ' + service.tipo + ' | ' + dataFormatada + ' | ' + valorFormatado + ' | ' + appUrl + '/painel/agendamentos') : Promise.resolve(false),
    ])

    const wa_link = inf?.whatsapp
      ? 'https://wa.me/' + inf.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent('Ola ' + inf.nome + '! Codigo: ' + codigo_confirmacao)
      : null

    return NextResponse.json({
      booking: {
        id: booking.id,
        codigo_confirmacao: booking.codigo_confirmacao,
        status: booking.status,
        data_agendada: booking.data_agendada,
      },
      wa_link,
      mensagens_enviadas: true,
    }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireInfluencer(req)
    if (!auth.influencer_id) {
      return NextResponse.json({ error: 'Perfil de influencer nao encontrado' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const data_inicio = searchParams.get('data_inicio')
    const data_fim = searchParams.get('data_fim')

    let query = db
      .from('bookings')
      .select('*, clients(*), services(*)')
      .eq('influencer_id', auth.influencer_id)
      .order('data_agendada', { ascending: true })

    if (status) query = query.eq('status', status as any)
    if (data_inicio) query = query.gte('data_agendada', data_inicio)
    if (data_fim) query = query.lte('data_agendada', data_fim)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return apiError(e)
  }
}
